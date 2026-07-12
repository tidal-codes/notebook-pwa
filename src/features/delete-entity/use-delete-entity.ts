import { useDeleteNote } from "@/entities/note/api/note.mutations";
import { toast } from "sonner";

export default function useDeleteEntity(id: string, type: "folder" | "note") {
  const { mutateAsync : deleteNote , isPending } = useDeleteNote();

  async function deleteEntity() {
    if (type === "note") {
      try{
        await deleteNote(id);
        toast.success("Note deleted successfully");
      }catch{
        toast.error("Failed to delete note");
      }
    } else if (type === "folder") {
      // Implement folder deletion logic here
    }
  }

  return { deleteEntity , isPending };
}
