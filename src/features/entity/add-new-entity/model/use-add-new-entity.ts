import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateFolder } from "@/entities/folder/api/folder.mutations";
import { useCreateNote } from "@/entities/note/api/note.mutations";
import type { TreeEntity } from "@/shared/model/types";
import useGetNotesData from "@/entities/note/model/use-get-notes-data";
import useGetFoldersData from "@/entities/folder/model/use-get-folders-data";
import { getNextUntitledName } from "@/shared/lib/get-entity-name";

type OnEntityCreated = (type: TreeEntity, id: string) => void;

export default function useAddNewEntity() {
  const queryClient = useQueryClient();
  const getNotesData = useGetNotesData();
  const getFoldersData = useGetFoldersData();
  const { mutate: addNote } = useCreateNote();
  const { mutate: addFolder } = useCreateFolder();

  const createItem = useCallback(
    (
      type: TreeEntity,
      parentFolderId: string | null,
      onEntityCreated: OnEntityCreated,
    ) => {
      const notes = getNotesData();
      const folders = getFoldersData();

      const siblingNames = (type === "note" ? notes : folders)
        .filter((item) => item.parent_id === parentFolderId)
        .map((item) => item.name);

      const name = getNextUntitledName(siblingNames);

      const id = crypto.randomUUID();
      const now = Date.now();

      const baseItem = {
        id,
        name,
        is_dirty: true,
        is_deleted: false,
        parent_id: parentFolderId,
        created_at: now,
        updated_at: now,
      };

      if (type === "note") {
        addNote({ ...baseItem, type: "note", content: "", emoji: null });
      } else {
        addFolder({ ...baseItem, type: "folder" });
      }

      onEntityCreated(type, id);
    },
    [queryClient, addNote, addFolder],
  );

  return { createItem };
}
