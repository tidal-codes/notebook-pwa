import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateFolder } from "@/entities/folder/api/folder.mutations";
import { useCreateNote } from "@/entities/note/api/note.mutations";
import type { BaseEntity, TreeEntity } from "@/shared/model/types";
import useGetNotesData from "@/entities/note/model/use-get-notes-data";
import useGetFoldersData from "@/entities/folder/model/use-get-folders-data";
import { getNextUntitledName } from "@/shared/lib/get-entity-name";
import type { JSONContent } from "@tiptap/core";
import type { SyncableFields } from "@/shared/model/syncable.types";

type OnEntityCreated = (type: TreeEntity, id: string) => void;

export default function useAddNewEntity() {
  const queryClient = useQueryClient();
  const getNotesData = useGetNotesData();
  const getFoldersData = useGetFoldersData();
  const { mutate: addNote } = useCreateNote();
  const { mutate: addFolder } = useCreateFolder();

  const emptyContent: JSONContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  };

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

      const baseItem: BaseEntity & SyncableFields = {
        id,
        name,
        is_dirty: 1,
        is_deleted: 0,
        version: 1,
        last_synced_version: 0,
        parent_id: parentFolderId,
        created_at: now,
        updated_at: now,
      };

      if (type === "note") {
        addNote({
          ...baseItem,
          type: "note",
          content: emptyContent,
        });
      } else {
        addFolder({ ...baseItem, type: "folder" });
      }

      onEntityCreated(type, id);
    },
    [queryClient, addNote, addFolder],
  );

  return { createItem };
}
