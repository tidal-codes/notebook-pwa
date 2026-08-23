import { db } from "@/app/indexed-db/db";
import type { NoteEntity } from "../model/types";

export async function createNote(note: NoteEntity) {
  await db.notes.add(note);

  return note;
}

export async function updateNote(id: string, data: Partial<NoteEntity>) {
  await db.notes.update(id, data);
}

export async function deleteNote(id: string, data: Partial<NoteEntity>) {
  await db.notes.update(id, data);
}


export async function getNote(id: string) {
  return db.notes.get(id);
}

export async function getNotes() {
  return db.notes.toArray();
}

export async function updateNotes(ids: string[], data: Partial<NoteEntity>) {

  await db.transaction("rw", db.notes, async () => {
    await Promise.all(ids.map((id) => db.notes.update(id, data)));
  });
}
