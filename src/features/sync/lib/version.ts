import type { SyncableFields } from "@/shared/model/syncable.types";

export function markMutated<T extends SyncableFields>(record: T): T {
  return {
    ...record,
    version: record.version + 1,
    isDirty: 1,
    updatedAt: Date.now(),
  };
}

export function markDeleted<T extends SyncableFields>(record: T): T {
  return {
    ...markMutated(record),
    isDeleted: 1,
  };
}

export function initSyncFields(now: number = Date.now()): SyncableFields {
  return {
    version: 1,
    last_synced_version: 0,
    is_dirty: 1,
    is_deleted: 0,
    created_at: now,
    updated_at: now,
  };
}
