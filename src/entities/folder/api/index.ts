import { db } from "@/app/indexed-db/db";
import type { FolderEntity } from "../model/types";

export async function createFolder(folder: FolderEntity) {
  await db.folders.add(folder);

  return folder;
}

export async function updateFolder(
  id: string,
  data: Partial<FolderEntity>
) {
  await db.folders.update(id, {
    ...data,
    updated_at: Date.now(),
    is_dirty : true
  });
}

export async function deleteFolder(id: string) {
  await db.folders.update(id, {
    is_deleted: true,
    updated_at: Date.now(),
    is_dirty: true,
  });
}


export async function getFolder(id: string) {
  return db.folders.get(id);
}


export async function getFolders() {
  return db.folders.toArray();
}

export async function updateFolders(
  ids: string[],
  data: Partial<FolderEntity>
) {
  const updatedAt = Date.now();

  await db.transaction("rw", db.folders, async () => {
    await Promise.all(
      ids.map((id) =>
        db.folders.update(id, {
          ...data,
          updated_at: updatedAt,
          is_dirty: true,
        })
      )
    );
  });
}