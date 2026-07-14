import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { MoveEntityDialogData } from "./type";
import { db } from "@/app/indexed-db/db";
import { updateFolder } from "@/entities/folder/api";
import { updateNote } from "@/entities/note/api";
import { toast } from "sonner";
import type { SelectedEntity } from "@/shared/model/types";
import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";
import { FOLDERS_KEY } from "@/entities/folder/api/query.key";
import { NOTES_KEY } from "@/entities/note/api/query.keys";
import { validateMoveTarget } from "./validate-move-target";
import { getNextUntitledName } from "../add-new-entity/lib/get-next-untitled-name";
import useGetFoldersData from "@/entities/folder/model/use-get-folders-data";
import useGetNotesData from "@/entities/note/model/use-get-notes-data";

class InvalidMoveError extends Error {
  public reason: "target-is-self" | "target-is-descendant";

  constructor(reason: "target-is-self" | "target-is-descendant") {
    super("Invalid move target");
    this.reason = reason;
  }
}

function getSiblingTitles<T extends { parent_id: string | null; name: string }>(
  items: T[],
  parentId: string | null,
) {
  return items
    .filter((item) => item.parent_id === parentId)
    .map((item) => item.name);
}

export default function useMoveEntities() {
  const getFoldersData = useGetFoldersData();
  const getNotesData = useGetNotesData();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["move-entities"],
    mutationFn: async ({
      entities,
      folder_id,
    }: MoveEntityDialogData & { folder_id: string | null }) => {
      const allFolders = getFoldersData();

      const allNotes = getNotesData();

      const validation = validateMoveTarget(entities, folder_id, allFolders);
      if (!validation.isValid) {
        throw new InvalidMoveError(validation.reason!);
      }

      const folderParentById = new Map(
        allFolders.map((folder) => [folder.id, folder.parent_id]),
      );

      const noteParentById = new Map(
        allNotes.map((note) => [note.id, note.parent_id]),
      );

      const entitiesToMove = entities.filter((entity) => {
        const currentParentId =
          entity.type === "folder"
            ? (folderParentById.get(entity.id) ?? null)
            : (noteParentById.get(entity.id) ?? null);

        return currentParentId !== folder_id;
      });

      const updatedAt = Date.now();

      const usedFolderTitles = new Set(getSiblingTitles(allFolders, folder_id));

      const usedNoteTitles = new Set(getSiblingTitles(allNotes, folder_id));

      await db.transaction("rw", db.notes, db.folders, async () => {
        await Promise.all([
          ...entitiesToMove
            .filter((entity) => entity.type === "folder")
            .map((entity) => {
              const name = getNextUntitledName([...usedFolderTitles]);
              usedFolderTitles.add(name);

              return updateFolder(entity.id, {
                parent_id: folder_id,
                name,
                updated_at: updatedAt,
                is_dirty: true,
              });
            }),

          ...entitiesToMove
            .filter((entity) => entity.type === "note")
            .map((entity) => {
              const name = getNextUntitledName([...usedNoteTitles]);
              usedNoteTitles.add(name);

              return updateNote(entity.id, {
                parent_id: folder_id,
                name,
                updated_at: updatedAt,
                is_dirty: true,
              });
            }),
        ]);
      });

      return { entities: entitiesToMove };
    },

    onSuccess: ({ entities }) => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });

      const total = entities.length;

      if (total === 0) return;

      toast.success(total > 1 ? `${total} items moved` : "Item moved");
    },

    onError: (error) => {
      if (error instanceof InvalidMoveError) {
        toast.error(
          error.reason === "target-is-self"
            ? "Can't move a folder into itself"
            : "Can't move a folder into one of its own subfolders",
        );
        return;
      }

      toast.error("Failed to move");
    },
  });

  const moveEntities = useCallback(
    (entities: SelectedEntity[], folder_id: string | null) =>
      mutateAsync({ entities, folder_id }),
    [mutateAsync],
  );

  return { moveEntities, isPending };
}
