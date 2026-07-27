import { useAppSelector } from "@/shared/config/store/hooks";
import NoteTitle from "./note-title";
import TabControllerSection from "./tab-controller-section";
import TabsSection from "./tabs-section";
import { selectActiveNoteId } from "@/entities/tabs/model/selectors";
import NewTabScreen from "./new-tab-screen";
import type { PropsWithChildren } from "react";

export default function EditorArea({ children }: PropsWithChildren) {
  const activeNoteId = useAppSelector(selectActiveNoteId);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full">
        <TabsSection />
      </div>
      <div className="flex-1 flex flex-col">
        <TabControllerSection noteId={activeNoteId} />
        <div className="mx-auto w-full max-w-3xl  py-3">
          {activeNoteId && <NoteTitle noteId={activeNoteId} />}
          {activeNoteId ? (
            <div className="flex-1">{children}</div>
          ) : (
            <NewTabScreen />
          )}
        </div>
      </div>
    </div>
  );
}
