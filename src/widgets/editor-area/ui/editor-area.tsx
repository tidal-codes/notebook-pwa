import { useAppSelector } from "@/shared/config/store/hooks";
import NoteTitle from "./note-title";
import TabControllerSection from "./tab-controller-section";
import TabsSection from "./tabs-section";
import {
  selectActiveNoteId,
  selectActiveTabId,
} from "@/entities/tabs/model/selectors";
import NewTabScreen from "./new-tab-screen";
import { useCallback, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { notesQueryOptions } from "@/entities/note/api/note.queries";
import type { NoteEntity } from "@/entities/note/model/types";
import { useUpdateNote } from "@/entities/note/api/note.mutations";
import type { JSONContent } from "@tiptap/react";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { getSearchIndexManager } from "@/features/search/global-search/model/search-index-manager";
import { selectNoteSearchUi } from "@/features/search/in-note-search/model/in-note-search-slice";
import { prepareEntityUpdate } from "@/shared/lib/prepare-entity";
import { getSyncManager } from "@/features/sync/model/create-sync-manager";
import useRefetchAppData from "@/features/sync/model/use-refetch-app-data";

export default function EditorArea({
  children,
}: {
  children: (
    note: NoteEntity,
    handleSaveNoteContent: (id: string, content: JSONContent) => void,
  ) => ReactNode;
}) {
  const activeNoteId = useAppSelector(selectActiveNoteId);
  const activeTabId = useAppSelector(selectActiveTabId);
  const { refetchAppData } = useRefetchAppData();
  const { mutate } = useUpdateNote();
  const { data: note } = useQuery({
    ...notesQueryOptions,
    select: (data) => data.find((note) => note.id === activeNoteId),
  });
  const { isOpen: isInNoteSearchOpen } = useAppSelector(
    selectNoteSearchUi(note?.id || "", activeTabId),
  );

  const handleSaveNoteContent = useCallback(
    (id: string, content: JSONContent) => {
      if (!note) return;
      mutate({ id, data: prepareEntityUpdate(note, { content }) });
      getSearchIndexManager()
        .notifyNoteChanged({ id, content })
        .catch((error) =>
          console.error("Failed to update search index", error),
        );
      getSyncManager(refetchAppData).notifyChange();
    },
    [mutate, note],
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full">
        <TabsSection />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <TabControllerSection noteTitle={note?.name} />
        <ScrollArea className="flex-1 min-h-0 relative">
          <div
            className={`mx-auto w-full max-w-3xl py-3 ${isInNoteSearchOpen && "mt-8"}`}
          >
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
