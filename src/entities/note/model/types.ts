import type { SyncableFields } from "@/shared/model/syncable.types";
import type { BaseEntity } from "@/shared/model/types";
import type { JSONContent } from "@tiptap/react";

export interface NoteEntity extends BaseEntity, SyncableFields {
  type: "note";
  content: JSONContent;
}

export type NoteSyncDTO = Pick<
  NoteEntity,
  | "id"
  | "parent_id"
  | "name"
  | "content"
  | "version"
  | "is_deleted"
  | "created_at"
  | "updated_at"
>;

export function toNoteDTO(note: NoteEntity): NoteSyncDTO {
  return {
    id: note.id,
    parent_id: note.parent_id,
    name: note.name,
    content: note.content,
    version: note.version,
    is_deleted: note.is_deleted,
    created_at: note.created_at,
    updated_at: note.updated_at,
  };
}

/** Maps a raw note row (from `sync_initial_snapshot` or a `sync_log` payload) into a local Note. */
export function fromNoteServerRow(row: NoteServerRow): NoteEntity {
  return {
    id: row.id,
    parent_id: row.parent_id,
    type: "note",
    name: row.name,
    content: row.content,
    version: row.version,
    // A record fresh from the server is by definition in sync with itself.
    last_synced_version: row.version,
    is_dirty: 0,
    is_deleted: row.is_deleted ? 1 : 0,
    created_at: new Date(row.created_at).getTime(),
    updated_at: new Date(row.updated_at).getTime(),
  };
}

export interface NoteServerRow {
  id: string;
  parent_id: string | null;
  name: string;
  content: JSONContent;
  version: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
