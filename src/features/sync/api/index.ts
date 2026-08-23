import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fromNoteServerRow,
  type NoteEntity,
  type NoteServerRow,
} from "@/entities/note/model/types";
import {
  fromFolderServerRow,
  type FolderEntity,
  type FolderServerRow,
} from "@/entities/folder/model/types";
import type { PushPayload } from "../model/sync-manager";
import { SYNC_CONFIG } from "../model/config";
import type {
  InitialSnapshotResponse,
  PullChangesPage,
  RawLogChange,
} from "../model/types";

export class SyncApiError extends Error {
  public readonly kind: "push-failed" | "pull-failed";
  constructor(kind: "push-failed" | "pull-failed", message: string) {
    super(message);
    this.name = "SyncApiError";
    this.kind = kind;
  }
}

const PULL_PAGE_SIZE = SYNC_CONFIG.pullPageSize;

export interface InitialSnapshotResult {
  notes: NoteEntity[];
  folders: FolderEntity[];
  cursor: number;
}

export interface SyncApi {
  push(payload: PushPayload): Promise<void>;
  pullInitial(): Promise<InitialSnapshotResult>;
  pullChanges(
    cursor: number,
  ): Promise<PullChangesPage<NoteEntity, FolderEntity>>;
}

export function createSupabaseSyncApi(client: SupabaseClient): SyncApi {
  return {
    async push(payload: PushPayload): Promise<void> {
      const { error } = await client.rpc("sync_push_batch", {
        p_notes: payload.notes,
        p_folders: payload.folders,
      });
      if (error) throw new SyncApiError("push-failed", error.message);
    },

    async pullInitial(): Promise<InitialSnapshotResult> {
      const { data, error } = await client.rpc("sync_initial_snapshot");
      if (error) throw new SyncApiError("pull-failed", error.message);

      const raw = data as InitialSnapshotResponse;
      console.log("INITIAL DATA" , raw)

      return {
        notes: (raw.notes as NoteServerRow[]).map((row) =>
          fromNoteServerRow(row),
        ),
        folders: (raw.folders as FolderServerRow[]).map((row) =>
          fromFolderServerRow(row),
        ),
        cursor: raw.cursor,
      };
    },

    async pullChanges(
      cursor: number,
    ): Promise<PullChangesPage<NoteEntity, FolderEntity>> {
      const { data, error } = await client.rpc("sync_pull_changes", {
        p_cursor: cursor,
        p_limit: PULL_PAGE_SIZE,
      });
      if (error) throw new SyncApiError("pull-failed", error.message);

      const raw = data as {
        changes: RawLogChange[];
        nextCursor: number;
        needsResync: boolean;
      };

      if (raw.needsResync) {
        return {
          noteChanges: [],
          folderChanges: [],
          nextCursor: cursor,
          hasMore: false,
          needsResync: true,
        };
      }
      
      const noteChanges: NoteEntity[] = [];
      const folderChanges: FolderEntity[] = [];

      // Server returns changes ordered by seq ascending, so if the same
      // entity appears twice in one page, pushing both in order and
      // letting the later one win on bulkPut is correct - no dedupe needed
      // for correctness, only as a minor future optimization.
      for (const change of raw.changes) {
        if (change.entity_type === "note") {
          noteChanges.push(
            fromNoteServerRow(change.payload as unknown as NoteServerRow),
          );
        } else {
          folderChanges.push(
            fromFolderServerRow(change.payload as unknown as FolderServerRow),
          );
        }
      }

      return {
        noteChanges,
        folderChanges,
        nextCursor: raw.nextCursor,
        hasMore: raw.changes.length === PULL_PAGE_SIZE,
        needsResync: false,
      };
    },
  };
}
