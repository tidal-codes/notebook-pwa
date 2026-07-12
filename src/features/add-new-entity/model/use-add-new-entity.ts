import { useCreateFolder } from "@/entities/folder/api/folder.mutations";
import { useCreateNote } from "@/entities/note/api/note.mutations";
import type { NoteEntity } from "@/entities/note/model/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getNextUntitledName } from "../lib/get-next-untitled-name";
import { NOTES_KEY } from "@/entities/note/api/query.keys";

import type { FolderEntity } from "@/entities/folder/model/types";
import type { PanelItemType } from "@/widgets/notes-panel/model";

export default function useAddNewEntity() {
  const queryClient = useQueryClient();
  const { mutate: addNote } = useCreateNote();
  const { mutate: addFolder } = useCreateFolder();

  const createItem = useCallback(
    (
      type: PanelItemType,
      parent_folder_id: string | null,
      onEntityCreated: (type: PanelItemType, id: string) => void,
    ) => {
      const noteTitles = (
        queryClient.getQueryData<NoteEntity[]>(NOTES_KEY) || []
      ).map((note) => note.name);
      const folderTitles = (
        queryClient.getQueryData<FolderEntity[]>(["folders"]) || []
      ).map((folder) => folder.name);

      const name = getNextUntitledName(
        type === "note" ? noteTitles : folderTitles,
      );
      const now = Date.now();
      const id = crypto.randomUUID();
      const parent_id = parent_folder_id;
      //   console.log("PARENT", parent_id);

      const baseItem = {
        id,
        name,
        is_dirty: true,
        is_deleted: false,
        parent_id,
        created_at: now,
        updated_at: now,
      };

      if (type === "note") {
        addNote({
          content: "",
          type: "note",
          emoji: null,
          ...baseItem,
        });
      } else {
        addFolder({
          type: "folder",
          ...baseItem,
        });
      }
      onEntityCreated(type, id);
    },
    [queryClient, addNote],
  );

  return { createItem };
}
