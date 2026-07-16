import { useAppSelector } from "@/shared/config/store/hooks";
import NoteTitle from "./note-title";
import TabControllerSection from "./tab-controller-section";
import TabsSection from "./tabs-section";
import { selectActiveNoteId } from "@/entities/tabs/model/selectors";
import NewTabScreen from "./new-tab-screen";

export default function EditorArea() {
  const activeNoteId = useAppSelector(selectActiveNoteId);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-card w-full px-4 py-3">
        <TabsSection />
      </div>
      <div className="flex-1 flex flex-col">
        <div>
          <TabControllerSection noteId={activeNoteId} />
          {activeNoteId && <NoteTitle noteId={activeNoteId} />}
        </div>
        {activeNoteId ? <div className="flex-1"></div> : <NewTabScreen />}
      </div>
    </div>
  );
}
