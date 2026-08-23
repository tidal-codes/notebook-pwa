import type { EntityType } from "@/shared/model/types";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncCycleResult {
  mode: "initial" | "incremental";
  pushedNotes: number;
  pushedFolders: number;
  upsertedNotes: number;
  deletedNotes: number;
  upsertedFolders: number;
  deletedFolders: number;
  pagesApplied: number;
}

export type SyncOutcome =
  | { status: "success"; result: SyncCycleResult }
  | { status: "skipped"; reason: "cannot-sync" | "already-syncing" }
  | { status: "error"; error: Error };

export interface RawLogChange {
  seq: number;
  entity_type: EntityType;
  entity_id: string;
  payload: Record<string, unknown>;
}

export interface PullChangesPage<TNote, TFolder> {
  noteChanges: TNote[];
  folderChanges: TFolder[];
  nextCursor: number;
  hasMore: boolean;
  needsResync: boolean;
}

export interface InitialSnapshotResponse {
  notes: unknown[];
  folders: unknown[];
  cursor: number;
}
