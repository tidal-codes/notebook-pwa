import { useAppSelector } from "@/shared/config/store/hooks";
import NoteTitle from "./note-title";
import TabControllerSection from "./tab-controller-section";
import TabsSection from "./tabs-section";
import { selectActiveNoteId } from "@/entities/tabs/model/selectors";
import NewTabScreen from "./new-tab-screen";
import { useCallback, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { notesQueryOptions } from "@/entities/note/api/note.queries";
import type { NoteEntity } from "@/entities/note/model/types";
import { useUpdateNote } from "@/entities/note/api/note.mutations";
import type { JSONContent } from "@tiptap/react";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";

export default function EditorArea({
  children,
}: {
  children: (
    note: NoteEntity,
    handleSaveNoteContent: (id: string, content: JSONContent) => void,
  ) => ReactNode;
}) {
  const activeNoteId = useAppSelector(selectActiveNoteId);
  const { mutate } = useUpdateNote();
  const { data: note } = useQuery({
    ...notesQueryOptions,
    select: (data) => data.find((note) => note.id === activeNoteId),
  });

  const handleSaveNoteContent = useCallback(
    (id: string, content: JSONContent) => {
      console.log("save called on this id:", id);
      mutate({ id, data: { content } });
    },
    [mutate],
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full">
        <TabsSection />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <TabControllerSection noteTitle={note?.name} />
        <ScrollArea className="flex-1 min-h-0">
          <div className="mx-auto w-full max-w-3xl py-3">
            {note && <NoteTitle note={note} />}
            {note ? (
              <div className="flex-1">
                {children(note, handleSaveNoteContent)}
              </div>
            ) : (
              <NewTabScreen />
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}