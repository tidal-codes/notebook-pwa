import { SearchableListDialog } from "@/shared/ui/searchable-list-dialog";
import { useGoToActions, useGoToOpen } from "./go-to-dialog-provider";
import useGetNotesData from "@/entities/note/model/use-get-notes-data";
import useOpenNote from "@/features/tabs/use-open-note";
import useAddNewEntity from "@/features/entity/add-new-entity/model/use-add-new-entity";

export default function GoToDialog() {
  const { hideDialog } = useGoToActions();
  const { open } = useGoToOpen();
  const getNotes = useGetNotesData();
  const { handleOpenNote } = useOpenNote();
  const { createItem } = useAddNewEntity();

  function openNote(noteId: string | null) {
    if (noteId) {
      hideDialog();
      setTimeout(() => {
        handleOpenNote(noteId, "ACTIVE_TAB");
      }, 100);
    }
  }

  function handleCreateNewNote(noteName: string) {
    createItem("note", null, (_, id) => openNote(id), noteName);
  }

  return (
    <SearchableListDialog
      open={open}
      onOpenChange={(open) => !open && hideDialog()}
      items={getNotes().map((note) => ({ id: note.id, title: note.name }))}
      searchPlaceholder="Type For A Note"
      onSelect={openNote}
      onCreate={handleCreateNewNote}
    />
  );
}
