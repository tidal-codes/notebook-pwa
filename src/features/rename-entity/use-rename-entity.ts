import { useUpdateFolder } from "@/entities/folder/api/folder.mutations";
import { useUpdateNote } from "@/entities/note/api/note.mutations";
import { toast } from "sonner";

export default function useRenameEntity(id: string, type: "folder" | "note") {
  const { mutate: updateNote } = useUpdateNote(
    () => {
      toast.error("Failed to rename note");
    },
    () => {
      toast.success("Note renamed successfully");
    },
  );
  const { mutate: updateFolder } = useUpdateFolder(
    () => {
      toast.error("Failed to rename folder");
    },
    () => {
      toast.success("Folder renamed successfully");
    },
  );

  function renameEntity(newName: string) {
    if (type === "note") {
      updateNote({ id, data: { name: newName } });
    } else if (type === "folder") {
      updateFolder({ id, data: { name: newName } });
    }
  }

  return { renameEntity };
}
