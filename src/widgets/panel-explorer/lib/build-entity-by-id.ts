import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";
import type { EntityMap } from "../model/types";



export function buildEntityById(
  folders: FolderEntity[],
  notes: NoteEntity[],
): EntityMap {
  const byId: EntityMap = new Map();

  for (const folder of folders) {
    byId.set(folder.id, folder);
  }

  for (const note of notes) {
    byId.set(note.id, note);
  }

  return byId;
}
