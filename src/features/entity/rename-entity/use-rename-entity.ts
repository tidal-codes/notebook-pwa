import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useUpdateFolder } from "@/entities/folder/api/folder.mutations";
import { FOLDERS_KEY } from "@/entities/folder/api/query.key";
import type { FolderEntity } from "@/entities/folder/model/types";

import { useUpdateNote } from "@/entities/note/api/note.mutations";

import type { NoteEntity } from "@/entities/note/model/types";


import { isTitleUnique } from "@/shared/lib/get-entity-name";
import { prepareEntityUpdate } from "@/shared/lib/prepare-entity";
import { NOTES_KEY } from "@/entities/note/api/query.keys";

interface RenameEntityParams {
  newName: string;
  oldName: string;
}

type RenameableEntity = NoteEntity | FolderEntity;

export default function useRenameEntity(entity: RenameableEntity) {
  const queryClient = useQueryClient();

  const { mutate: updateNote } = useUpdateNote(
    () => toast.error("Failed to rename note"),
    () => toast.success("Note renamed successfully"),
  );

  const { mutate: updateFolder } = useUpdateFolder(
    () => toast.error("Failed to rename folder"),
    () => toast.success("Folder renamed successfully"),
  );

  function renameEntity({ newName, oldName }: RenameEntityParams) {
    const trimmedName = newName.trim();

    if (trimmedName === "") {
      toast.error("Title shouldn't be empty");
      return;
    }

    if (trimmedName === oldName.trim()) {
      return;
    }

    const parentId = entity.parent_id;

    if (entity.type === "note") {
      const notes = queryClient.getQueryData<NoteEntity[]>(NOTES_KEY) ?? [];

      const siblingNames = notes
        .filter((note) => note.parent_id === parentId && note.id !== entity.id)
        .map((note) => note.name);

      if (!isTitleUnique(siblingNames, trimmedName)) {
        toast.error("An item with this name already exists");
        return;
      }

      updateNote({
        id: entity.id,
        data: prepareEntityUpdate(entity, {
          name: trimmedName,
        }),
      });

      return;
    }

    const folders = queryClient.getQueryData<FolderEntity[]>(FOLDERS_KEY) ?? [];

    const siblingNames = folders
      .filter(
        (folder) => folder.parent_id === parentId && folder.id !== entity.id,
      )
      .map((folder) => folder.name);

    if (!isTitleUnique(siblingNames, trimmedName)) {
      toast.error("An item with this name already exists");
      return;
    }

    updateFolder({
      id: entity.id,
      data: prepareEntityUpdate(entity, {
        name: trimmedName,
      }),
    });
  }

  return { renameEntity };
}
