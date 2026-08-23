import type {
  FolderEntity,
  FolderSyncDTO,
} from "@/entities/folder/model/types";
import type { NoteEntity, NoteSyncDTO } from "@/entities/note/model/types";
import type {
  SyncRepository,
  SyncStateRepository,
} from "@/shared/lib/sync-repository";
import type { SyncApi } from "../api";
import type { SyncCycleResult, SyncOutcome, SyncStatus } from "./types";
import { chunk } from "../lib/chunk";
import { buildChangeBatchResult } from "../lib/reconcile-change";

export interface PushPayload {
  notes: NoteSyncDTO[];
  folders: FolderSyncDTO[];
}

export interface ApplyInitialSnapshotFn {
  (payload: {
    notes: NoteEntity[];
    folders: FolderEntity[];
    cursor: number;
  }): Promise<void>;
}

export interface ApplyChangeBatchFn {
  (payload: {
    notesUpsert: NoteEntity[];
    notesDelete: string[];
    foldersUpsert: FolderEntity[];
    foldersDelete: string[];
    cursor: number;
  }): Promise<void>;
}

const CROSS_TAB_LOCK_NAME = "reelkeep-sync-cycle";

export interface SyncManagerDeps {
  noteRepo: SyncRepository<NoteEntity>;
  folderRepo: SyncRepository<FolderEntity>;
  syncStateRepo: SyncStateRepository;
  toNoteDTO: (note: NoteEntity) => NoteSyncDTO;
  toFolderDTO: (folder: FolderEntity) => FolderSyncDTO;
  applyInitialSnapshot: ApplyInitialSnapshotFn;
  applyChangeBatch: ApplyChangeBatchFn;
  api: SyncApi;
  debounceMs: number;
  heartbeatMs: number;
  pushChunkSize: number;
}

export class SyncManager {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  private canSyncFlag: boolean = false;
  private pendingRerun = false;
  private isSyncing = false;

  private status: SyncStatus = "idle";
  private listeners = new Set<(status: SyncStatus) => void>();

  private readonly deps: SyncManagerDeps;

  constructor(deps: SyncManagerDeps) {
    this.deps = deps;
  }

  notifyChange(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.syncNow();
    }, this.deps.debounceMs);
  }

  startHeartbeat(intervalMs: number = this.deps.heartbeatMs): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      void this.syncNow();
    }, intervalMs);
  }

  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  setCanSync(value: boolean): void {
    const becameTrue = value && !this.canSyncFlag;
    const becameFalse = !value && this.canSyncFlag;
    this.canSyncFlag = value;

    if (becameTrue) {
      this.startHeartbeat();
      void this.syncNow();
    } else if (becameFalse) {
      this.stopHeartbeat();
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
    }
  }

  async syncNow(): Promise<SyncOutcome> {
    if (!this.canSyncFlag) {
      this.setStatus("idle");
      return { status: "skipped", reason: "cannot-sync" };
    }

    if (this.isSyncing) {
      this.pendingRerun = true;
      return { status: "skipped", reason: "already-syncing" };
    }

    this.isSyncing = true;
    this.setStatus("syncing");

    try {
      const result = await this.withCrossTabLock(() => this.runCycle());
      this.setStatus("success");
      return { status: "success", result };
    } catch (error) {
      this.setStatus("error");
      return { status: "error", error: error as Error };
    } finally {
      this.isSyncing = false;
      if (this.pendingRerun) {
        this.pendingRerun = false;
        void this.syncNow();
      }
    }
  }

  subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  destroy(): void {
    this.stopHeartbeat();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.listeners.clear();
  }

  private setStatus(status: SyncStatus): void {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }

  private async withCrossTabLock<T>(fn: () => Promise<T>): Promise<T> {
    if (typeof navigator === "undefined") return fn();
    const locks = (
      navigator as unknown as {
        locks?: { request: (name: string, cb: () => Promise<T>) => Promise<T> };
      }
    ).locks;
    if (!locks) return fn();
    return locks.request(CROSS_TAB_LOCK_NAME, fn);
  }

  private async runCycle(): Promise<SyncCycleResult> {
    const [dirtyNotes, dirtyFolders] = await Promise.all([
      this.deps.noteRepo.getDirty(),
      this.deps.folderRepo.getDirty(),
    ]);

    const notesSnapshot = new Map(dirtyNotes.map((n) => [n.id, n.version]));
    const foldersSnapshot = new Map(dirtyFolders.map((f) => [f.id, f.version]));

    // Push in bounded chunks - a single huge dirty set (bulk import,
    // catching up after a long time offline with heavy local edits)
    // must not become one unbounded RPC call/payload.
    await this.pushDirty(dirtyNotes, dirtyFolders);

    const cursor = await this.deps.syncStateRepo.getCursor();

    if (cursor === null) {
      return this.runInitialSync(dirtyNotes.length, dirtyFolders.length);
    }

    // Local integrity check - see docs/00-full-guide.md, "Edge Cases:
    // local data wiped out from under the sync engine". Only meaningful
    // when nothing is currently dirty: a legitimate reduction in row
    // count can NEVER happen without first going through a dirty
    // soft-delete state (deletes are soft until synced), so if the count
    // dropped with nothing dirty to explain it, something outside the
    // sync engine's control touched local storage directly.
    if (dirtyNotes.length === 0 && dirtyFolders.length === 0) {
      const [actualNotes, actualFolders, expectedCount] = await Promise.all([
        this.deps.noteRepo.count(),
        this.deps.folderRepo.count(),
        this.deps.syncStateRepo.getRecordCount(),
      ]);
      const actualCount = actualNotes + actualFolders;
      if (expectedCount > 0 && actualCount < expectedCount) {
        return this.runInitialSync(0, 0);
      }
    }

    return this.runIncrementalPull(
      cursor,
      notesSnapshot,
      foldersSnapshot,
      dirtyNotes.length,
      dirtyFolders.length,
    );
  }

  private async pushDirty(
    dirtyNotes: NoteEntity[],
    dirtyFolders: FolderEntity[],
  ): Promise<void> {
    if (dirtyNotes.length === 0 && dirtyFolders.length === 0) return;

    const noteChunks = chunk(dirtyNotes, this.deps.pushChunkSize);
    const folderChunks = chunk(dirtyFolders, this.deps.pushChunkSize);
    const pageCount = Math.max(noteChunks.length, folderChunks.length, 1);

    for (let i = 0; i < pageCount; i++) {
      const notesPage = noteChunks[i] ?? [];
      const foldersPage = folderChunks[i] ?? [];
      if (notesPage.length === 0 && foldersPage.length === 0) continue;

      await this.deps.api.push({
        notes: notesPage.map(this.deps.toNoteDTO),
        folders: foldersPage.map(this.deps.toFolderDTO),
      });
    }
  }

  private async runInitialSync(
    pushedNotes: number,
    pushedFolders: number,
  ): Promise<SyncCycleResult> {
    const snapshot = await this.deps.api.pullInitial();
    await this.deps.applyInitialSnapshot(snapshot);

    return {
      mode: "initial",
      pushedNotes,
      pushedFolders,
      upsertedNotes: snapshot.notes.length,
      deletedNotes: 0,
      upsertedFolders: snapshot.folders.length,
      deletedFolders: 0,
      pagesApplied: 1,
    };
  }

  private async runIncrementalPull(
    startCursor: number,
    notesSnapshot: Map<string, number>,
    foldersSnapshot: Map<string, number>,
    pushedNotes: number,
    pushedFolders: number,
  ): Promise<SyncCycleResult> {
    let cursor = startCursor;
    let hasMore = true;
    let pagesApplied = 0;
    let upsertedNotes = 0;
    let deletedNotes = 0;
    let upsertedFolders = 0;
    let deletedFolders = 0;

    while (hasMore) {
      const page = await this.deps.api.pullChanges(cursor);

      if (page.needsResync) {
        const result = await this.runInitialSync(pushedNotes, pushedFolders);
        return { ...result, pagesApplied: pagesApplied + result.pagesApplied };
      }

      const noteIds = page.noteChanges.map((n) => n.id);
      const folderIds = page.folderChanges.map((f) => f.id);
      const [localNotes, localFolders] = await Promise.all([
        this.deps.noteRepo.bulkGet(noteIds),
        this.deps.folderRepo.bulkGet(folderIds),
      ]);

      const noteResult = buildChangeBatchResult(
        page.noteChanges,
        localNotes,
        notesSnapshot,
      );
      const folderResult = buildChangeBatchResult(
        page.folderChanges,
        localFolders,
        foldersSnapshot,
      );

      await this.deps.applyChangeBatch({
        notesUpsert: noteResult.toUpsert,
        notesDelete: noteResult.toDelete,
        foldersUpsert: folderResult.toUpsert,
        foldersDelete: folderResult.toDelete,
        cursor: page.nextCursor,
      });

      cursor = page.nextCursor;
      hasMore = page.hasMore;
      pagesApplied += 1;
      upsertedNotes += noteResult.toUpsert.length;
      deletedNotes += noteResult.toDelete.length;
      upsertedFolders += folderResult.toUpsert.length;
      deletedFolders += folderResult.toDelete.length;
    }

    return {
      mode: "incremental",
      pushedNotes,
      pushedFolders,
      upsertedNotes,
      deletedNotes,
      upsertedFolders,
      deletedFolders,
      pagesApplied,
    };
  }
}
