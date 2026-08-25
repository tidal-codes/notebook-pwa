export interface SyncStateRow {
  id: "global";
  cursor: number | null;
  lastSyncedAt: number | null;
  recordCount: number;
}

export const INITIAL_SYNC_STATE: SyncStateRow = {
  id: "global",
  cursor: null,
  lastSyncedAt: null,
  recordCount: 0,
};
