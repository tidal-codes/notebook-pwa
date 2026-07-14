import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateFolder } from "@/entities/folder/api/folder.mutations";
import { useCreateNote } from "@/entities/note/api/note.mutations";
import type { NoteEntity } from "@/entities/note/model/types";
import type { FolderEntity } from "@/entities/folder/model/types";
import type { TreeEntity } from "@/shared/model/types";
import { NOTES_KEY } from "@/entities/note/api/query.keys";
import { FOLDERS_KEY } from "@/entities/folder/api/query.key";
import { getNextUntitledName } from "@/shared/lib/get-next-untitled-name";
import useGetFoldersData from "@/entities/folder/model/use-get-folders-data";
import useGetNotesData from "@/entities/note/model/use-get-notes-data";


type OnEntityCreated = (type: TreeEntity, id: string) => void;

export default function useCloneEntity() {
  const queryClient = useQueryClient();
  const getFoldersData = useGetFoldersData();
  const getNotesData = useGetNotesData();
  const { mutate: addNote } = useCreateNote();
  const { mutate: addFolder } = useCreateFolder();

  const cloneNote = useCallback(
    (note: NoteEntity, siblingNames: string[]): NoteEntity => {
      const now = Date.now();
      const cloned: NoteEntity = {
        ...note,
        id: crypto.randomUUID(),
        name: getNextUntitledName(siblingNames, note.name),
        created_at: now,
        updated_at: now,
        is_dirty: true,
        is_deleted: false,
      };
      addNote(cloned);
      return cloned;
    },
    [addNote],
  );

  const cloneFolder = useCallback(
    (
      folder: FolderEntity,
      siblingFolderNames: string[],
      allFolders: FolderEntity[],
      allNotes: NoteEntity[],
    ): FolderEntity => {
      const now = Date.now();

      // ۱. خود فولدر ریشه رو با اسم ایندکس‌دار کلون کن
      const newRootId = crypto.randomUUID();
      const clonedRoot: FolderEntity = {
        ...folder,
        id: newRootId,
        name: getNextUntitledName(siblingFolderNames, folder.name),
        created_at: now,
        updated_at: now,
        is_dirty: true,
        is_deleted: false,
      };
      addFolder(clonedRoot);

      // ۲. نگاشت parent_id -> فرزندان، دقیقاً همون الگوی resolveDeletionSet
      const childrenByParentId = new Map<string, (FolderEntity | NoteEntity)[]>();

      for (const entity of [...allFolders, ...allNotes]) {
        if (entity.parent_id === null) continue;
        const siblings = childrenByParentId.get(entity.parent_id);
        siblings ? siblings.push(entity) : childrenByParentId.set(entity.parent_id, [entity]);
      }

      // ۳. نگاشت ایدی فولدر قدیمی -> ایدی فولدر جدید، برای remap کردن parent_id فرزندان
      const idMap = new Map<string, string>([[folder.id, newRootId]]);

      // BFS روی کل زیردرخت؛ برای فرزندها نیازی به بررسی تصادم اسم نیست
      // چون مقصدشون یه فولدر کاملاً تازه‌ست
      const queue: string[] = [folder.id];

      while (queue.length > 0) {
        const currentOldId = queue.shift()!;
        const children = childrenByParentId.get(currentOldId);
        if (!children) continue;

        const newParentId = idMap.get(currentOldId)!;

        for (const child of children) {
          const newId = crypto.randomUUID();

          if (child.type === "folder") {
            idMap.set(child.id, newId);
            addFolder({
              ...child,
              id: newId,
              parent_id: newParentId,
              created_at: now,
              updated_at: now,
              is_dirty: true,
              is_deleted: false,
            });
            queue.push(child.id);
          } else {
            addNote({
              ...child,
              id: newId,
              parent_id: newParentId,
              created_at: now,
              updated_at: now,
              is_dirty: true,
              is_deleted: false,
            });
          }
        }
      }

      return clonedRoot;
    },
    [addFolder, addNote],
  );

  const cloneEntity = useCallback(
    (type: TreeEntity, id: string, onEntityCreated: OnEntityCreated) => {
      const notes = getNotesData();
      const folders = getFoldersData();

      if (type === "note") {
        const note = notes.find((n) => n.id === id);
        if (!note) return;

        const siblingNames = notes
          .filter((n) => n.parent_id === note.parent_id)
          .map((n) => n.name);

        const cloned = cloneNote(note, siblingNames);
        onEntityCreated("note", cloned.id);
        return;
      }

      const folder = folders.find((f) => f.id === id);
      if (!folder) return;

      const siblingFolderNames = folders
        .filter((f) => f.parent_id === folder.parent_id)
        .map((f) => f.name);

      const cloned = cloneFolder(folder, siblingFolderNames, folders, notes);
      onEntityCreated("folder", cloned.id);
    },
    [queryClient, cloneNote, cloneFolder],
  );

  return { cloneEntity };
}