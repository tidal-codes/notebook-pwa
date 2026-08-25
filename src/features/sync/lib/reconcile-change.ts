import type { SyncableEntity } from "@/shared/model/syncable.types";


export type ChangeDecision<T extends SyncableEntity> =
  | { action: "upsert"; record: T }
  | { action: "delete"; id: string }
  | { action: "skip" };

export function decideChangeApplication<T extends SyncableEntity>(
  local: T | undefined,
  incoming: T,
  pushedVersion: number | undefined,
): ChangeDecision<T> {
  const synced = {
    ...incoming,
    is_dirty: 0 as const,
    lastSyncedVersion: incoming.version,
  };

  if (pushedVersion !== undefined) {
    if (!local || local.version === pushedVersion) {
      return incoming.is_deleted
        ? { action: "delete", id: incoming.id }
        : { action: "upsert", record: synced };
    }

    return { action: "skip" };
  }


  if (!local) {
    if (incoming.is_deleted) return { action: "skip" }; 
    return { action: "upsert", record: synced };
  }

  if (!local.is_dirty) {
    if (incoming.is_deleted) return { action: "delete", id: incoming.id };
    if (incoming.updated_at >= local.updated_at)
      return { action: "upsert", record: synced };
    return { action: "skip" };
  }


  if (incoming.updated_at > local.updated_at) {

    return incoming.is_deleted
      ? { action: "delete", id: incoming.id }
      : { action: "upsert", record: synced };
  }

  return { action: "skip" };
}

export interface ChangeBatchResult<T extends SyncableEntity> {
  toUpsert: T[];
  toDelete: string[];
}


export function buildChangeBatchResult<T extends SyncableEntity>(
  changes: T[],
  localById: Map<string, T>,
  pushedSnapshot: Map<string, number>,
): ChangeBatchResult<T> {
  const toUpsert: T[] = [];
  const toDelete: string[] = [];

  for (const incoming of changes) {
    const decision = decideChangeApplication(
      localById.get(incoming.id),
      incoming,
      pushedSnapshot.get(incoming.id),
    );
    if (decision.action === "upsert") toUpsert.push(decision.record);
    else if (decision.action === "delete") toDelete.push(decision.id);
  }

  return { toUpsert, toDelete };
}
