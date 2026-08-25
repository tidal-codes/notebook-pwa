import { db } from "@/app/indexed-db/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { resolveDeletionSet, type TreeEntityRef } from "./resolve-deletion-set";
import { updateFolder } from "@/entities/folder/api";
import { updateNote } from "@/entities/note/api";
import type { SelectedEntity } from "@/shared/model/types";
import useGetFoldersData from "@/entities/folder/model/use-get-folders-data";
import useGetNotesData from "@/entities/note/model/use-get-notes-data";
import { prepareEntityDelete } from "@/shared/lib/prepare-entity";
import { getSearchIndexManager } from "@/features/search/global-search/model/search-index-manager";

export default function useDeleteEntities() {
  const queryClient = useQueryClient();
  const getFoldersData = useGetFoldersData();
  const getNotesData = useGetNotesData();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["delete-entities"],
    mutationFn: async (selectedItems: SelectedEntity[]) => {
      const folders = getFoldersData();
      const notes = getNotesData();

      const allEntities: TreeEntityRef[] = [
        ...folders.map((f) => ({
          id: f.id,
          parent_id: f.parent_id,
          type: "folder" as const,
        })),
        ...notes.map((n) => ({
          id: n.id,
          parent_id: n.parent_id,
          type: "note" as const,
        })),
      ];

      const { folderIds, noteIds } = resolveDeletionSet(
        selectedItems,
        allEntities,
      );

      await db.transaction("rw", db.notes, db.folders, async () => {
        await Promise.all([
          ...folderIds.map((id) => {
            const folder = folders.find((folder) => folder.id === id)!;
            return updateFolder(id, prepareEntityDelete(folder));
          }),
          ...noteIds.map((id) => {
            const note = notes.find((note) => note.id === id)!;
            getSearchIndexManager().notifyNoteDeleted(id);
            return updateNote(id, prepareEntityDelete(note));
          }),
        ]);
      });

      return { folderIds, noteIds };
    },
    onSuccess: ({ folderIds, noteIds }) => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      const total = folderIds.length + noteIds.length;
      toast.success(total > 1 ? `${total} items deleted` : "Item deleted");
    },
    onError: () => {
      toast.error("Failed to delete");
    },
  });

  const deleteEntities = useCallback(
    (items: SelectedEntity | SelectedEntity[]) => {
      const list = Array.isArray(items) ? items : [items];
      return mutateAsync(list);
    },
    [mutateAsync],
  );

  return { deleteEntities, isPending };
}
