import Dexie, { type Table } from "dexie";
import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";

export class NotesDatabase extends Dexie {
  folders!: Table<FolderEntity>;
  notes!: Table<NoteEntity>;

  constructor() {
    super("notes-db");

    this.version(1).stores({
      folders: "id",
      notes: "id",
    });
  }
}

export const db = new NotesDatabase();
