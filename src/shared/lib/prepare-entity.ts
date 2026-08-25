import type { SyncableEntity, SyncableFields } from "../model/syncable.types";
import type { BaseEntity } from "../model/types";

type EntityUpdate<T extends BaseEntity & SyncableFields> = Partial<
  Omit<T, keyof SyncableFields | "id" | "type">
>;

export function prepareEntityUpdate<T extends BaseEntity & SyncableFields>(
  entity: T,
  changes: EntityUpdate<T>,
): T {
  const now = Date.now();

  return {
    ...entity,
    ...changes,

    version: entity.version + 1,
    is_dirty: 1,
    updated_at: now,
  };
}

export function prepareEntityDelete<
  T extends SyncableEntity
>(entity: T): T {
  return {
    ...entity,
    is_deleted: 1,
    is_dirty: 1,
    version: entity.version + 1,
    updated_at: Date.now(),
  };
}
