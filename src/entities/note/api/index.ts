import { db } from "@/app/indexed-db/db";
import type { NoteEntity } from "../model/types";

export async function createNote(note: NoteEntity) {
  await db.notes.add(note);

  return note;
}

export async function updateNote(
  id: string,
  data: Partial<NoteEntity>
) {
  await db.notes.update(id, {
    ...data,
    updated_at: Date.now(),
    is_dirty : true
  });
}

export async function moveToTrash(id: string) {
  await db.notes.update(id, {
    is_deleted: true,
    updated_at: Date.now(),
    is_dirty: true
  });
}

export async function deleteNote(id : string){
    await db.notes.delete(id);
}

export async function getNote(id: string) {
  return db.notes.get(id);
}


export async function getNotes() {
  return db.notes.toArray();
}