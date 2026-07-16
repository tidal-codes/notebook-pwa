import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUpdateFolder } from "@/entities/folder/api/folder.mutations";
import { FOLDERS_KEY } from "@/entities/folder/api/query.key";
import type { FolderEntity } from "@/entities/folder/model/types";
import { useUpdateNote } from "@/entities/note/api/note.mutations";
import { NOTES_KEY } from "@/entities/note/api/query.keys";
import type { NoteEntity } from "@/entities/note/model/types";
import type { TreeEntity } from "@/shared/model/types";
import { isTitleUnique } from "@/shared/lib/get-entity-name";

interface RenameEntityParams {
  newName: string;
  oldName: string;
  parent_id: string | null;
}

export default function useRenameEntity(id: string, type: TreeEntity) {
  const queryClient = useQueryClient();

  const { mutate: updateNote } = useUpdateNote(
    () => toast.error("Failed to rename note"),
    () => toast.success("Note renamed successfully"),
  );

  const { mutate: updateFolder } = useUpdateFolder(
    () => toast.error("Failed to rename folder"),
    () => toast.success("Folder renamed successfully"),
  );

  function renameEntity({ newName, oldName, parent_id }: RenameEntityParams) {
    const trimmedName = newName.trim();

    if (trimmedName === "") {
      toast.error("Title shouldn't be empty");
      return;
    }

    if (trimmedName === oldName.trim()) {
      return;
    }

    const notes = queryClient.getQueryData<NoteEntity[]>(NOTES_KEY) ?? [];
    const folders = queryClient.getQueryData<FolderEntity[]>(FOLDERS_KEY) ?? [];

    const siblingNames = (type === "note" ? notes : folders)
      .filter((item) => item.parent_id === parent_id && item.id !== id)
      .map((item) => item.name);

    if (!isTitleUnique(siblingNames, trimmedName)) {
      toast.error("An item with this name already exists");
      return;
    }

    if (type === "note") {
      updateNote({ id, data: { name: trimmedName } });
    } else {
      updateFolder({ id, data: { name: trimmedName } });
    }
  }

  return { renameEntity };
}
