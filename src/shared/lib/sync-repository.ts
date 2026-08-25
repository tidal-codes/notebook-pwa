import type { Table } from "dexie";
import { db as database } from "@/app/indexed-db/db";
import type { NoteEntity } from "@/entities/note/model/types";
import type { FolderEntity } from "@/entities/folder/model/types";
import type { SyncStateRow } from "./sync-state";
import type { SyncableEntity } from "../model/syncable.types";

export interface SyncRepository<T extends SyncableEntity> {
  getDirty(): Promise<T[]>;
  /**
   * Fetch only the specific records referenced by an incoming change batch.
   * Deliberately NOT `getAll()` - loading the full table on every sync is
   * exactly the cost incremental sync is meant to avoid.
   */
  bulkGet(ids: string[]): Promise<Map<string, T>>;
  /** Cheap total row count, used only for the local integrity check. */
  count(): Promise<number>;
}

export function createSyncRepository<T extends SyncableEntity>(
  table: Table<T, string>,
): SyncRepository<T> {
  return {
    getDirty: () => table.where("is_dirty").equals(1).toArray(),
    async bulkGet(ids) {
      if (ids.length === 0) return new Map();
      const records = await table.bulkGet(ids);
      const map = new Map<string, T>();
      records.forEach((record, i) => {
        if (record) map.set(ids[i], record);
      });
      return map;
    },
    count: () => table.count(),
  };
}

export interface SyncStateRepository {
  getCursor(): Promise<number | null>;
  /** Row count as of the last successful apply - see `SyncStateRow.recordCount`. */
  getRecordCount(): Promise<number>;
}

export function createSyncStateRepository(
  table: Table<SyncStateRow, string>,
): SyncStateRepository {
  return {
    async getCursor() {
      const row = await table.get("global");
      return row?.cursor ?? null;
    },
    async getRecordCount() {
      const row = await table.get("global");
      return row?.recordCount ?? 0;
    },
  };
}

// -------------------------------------------------------------------------
// Atomic writes. Both apply* functions bundle the entity writes, the
// cursor advance, AND the integrity trip-wire count into a single Dexie
// transaction, so a crash/interruption can never leave any of those three
// out of sync with each other.
// -------------------------------------------------------------------------

export interface InitialSnapshotPayload {
  notes: NoteEntity[];
  folders: FolderEntity[];
  cursor: number;
}

export async function applyInitialSnapshot(
  db: typeof database,
  { notes, folders, cursor }: InitialSnapshotPayload,
): Promise<void> {
  await db.transaction("rw", db.notes, db.folders, db.syncState, async () => {
    await db.notes.clear();
    await db.folders.clear();
    console.log("NOTES AND FOLDERS", notes, folders);
    if (notes.length) await db.notes.bulkPut(notes);
    if (folders.length) await db.folders.bulkPut(folders);
    await db.syncState.put({
      id: "global",
      cursor,
      lastSyncedAt: Date.now(),
      recordCount: notes.length + folders.length,
    });
  });
}

export interface ApplyChangeBatchPayload {
  notesUpsert: NoteEntity[];
  notesDelete: string[];
  foldersUpsert: FolderEntity[];
  foldersDelete: string[];
  cursor: number;
}

export async function applyChangeBatch(
  db: typeof database,
  {
    notesUpsert,
    notesDelete,
    foldersUpsert,
    foldersDelete,
    cursor,
  }: ApplyChangeBatchPayload,
): Promise<void> {
  await db.transaction("rw", db.notes, db.folders, db.syncState, async () => {
    if (notesUpsert.length) await db.notes.bulkPut(notesUpsert);
    if (notesDelete.length) await db.notes.bulkDelete(notesDelete);
    if (foldersUpsert.length) await db.folders.bulkPut(foldersUpsert);
    if (foldersDelete.length) await db.folders.bulkDelete(foldersDelete);

    // Computed AFTER the writes above, inside the same transaction, so it
    // always reflects reality regardless of how many of these arrays were
    // upserts vs deletes vs empty.
    const recordCount = (await db.notes.count()) + (await db.folders.count());
    await db.syncState.put({
      id: "global",
      cursor,
      lastSyncedAt: Date.now(),
      recordCount,
    });
  });
}
