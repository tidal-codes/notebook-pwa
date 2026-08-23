import type { SyncableFields } from "@/shared/model/syncable.types";
import type { BaseEntity } from "@/shared/model/types";

export interface FolderEntity extends BaseEntity, SyncableFields {
  type: "folder";
}

export type FolderSyncDTO = Pick<
  FolderEntity,
  | "id"
  | "parent_id"
  | "name"
  | "version"
  | "is_deleted"
  | "created_at"
  | "updated_at"
>;

export function toFolderDTO(folder: FolderEntity): FolderSyncDTO {
  return {
    id: folder.id,
    parent_id: folder.parent_id,
    name: folder.name,
    version: folder.version,
    is_deleted: folder.is_deleted,
    created_at: folder.created_at,
    updated_at: folder.updated_at,
  };
}

export function fromFolderServerRow(
  row: FolderServerRow,
  // userId: string,
): FolderEntity {
  return {
    id: row.id,
    type: "folder",
    // userId,
    parent_id: row.parent_id,
    name: row.name,
    version: row.version,
    last_synced_version: row.version,
    is_dirty: 0,
    is_deleted: row.is_deleted ? 1 : 0,
    created_at: new Date(row.created_at).getTime(),
    updated_at: new Date(row.updated_at).getTime(),
  };
}

export interface FolderServerRow {
  id: string;
  parent_id: string | null;
  name: string;
  version: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
