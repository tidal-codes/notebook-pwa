
export interface SyncableFields {
  version: number;
  last_synced_version: number;
  is_dirty: DirtyFlag;
  is_deleted: DirtyFlag;
  created_at: number;
  updated_at: number;
}

export type DirtyFlag = 0 | 1;


export interface SyncableEntity extends SyncableFields {
  id: string;
}
