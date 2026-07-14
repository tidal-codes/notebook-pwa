import { db } from "@/app/indexed-db/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { resolveDeletionSet, type SelectedEntity, type TreeEntityRef } from "./resolve-deletion-set";
import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";

export default function useDeleteEntities() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["delete-entities"],
    mutationFn: async (selectedItems: SelectedEntity[]) => {
      // اینجا چون داخل mutationFn هستیم و نه useEffect، خوندن مستقیم از کش
      // مشکلی نداره — دیتا در لحظه‌ی اجرای mutation (نه در closure رندر) خونده می‌شه
      const folders = queryClient.getQueryData<FolderEntity[]>(["folders"]) ?? [];
      const notes = queryClient.getQueryData<NoteEntity[]>(["notes"]) ?? [];

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
      const updatedAt = Date.now();

      await db.transaction("rw", db.notes, db.folders, async () => {
        await Promise.all([
          ...folderIds.map((id) =>
            db.folders.update(id, {
              is_deleted: true,
              updated_at: updatedAt,
              is_dirty: true,
            }),
          ),
          ...noteIds.map((id) =>
            db.notes.update(id, {
              is_deleted: true,
              updated_at: updatedAt,
              is_dirty: true,
            }),
          ),
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
