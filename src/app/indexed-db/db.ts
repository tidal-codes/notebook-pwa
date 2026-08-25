import Dexie, { type Table } from "dexie";
import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";
import type { SyncStateRow } from "@/shared/lib/sync-state";

export class NotesDatabase extends Dexie {
  folders!: Table<FolderEntity>;
  notes!: Table<NoteEntity>;
  syncState!: Table<SyncStateRow, string>;

  constructor() {
    super("notes-db");

    this.version(1).stores({
      folders: "id",
      notes: "id",
    });

    this.version(2).stores({
      notes: "id, folder_id, is_dirty, updated_at",
      folders: "id, folder_id, is_dirty, updated_at",
    });

    this.version(3).stores({
      notes: "id, folder_id, is_dirty, updated_at",
      folders: "id, folder_id, is_dirty, updated_at",
      syncState: "id",
    });
  }
}

export const db = new NotesDatabase();
