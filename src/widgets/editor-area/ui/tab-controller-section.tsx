import { Button } from "@/shared/ui/button";
import { ArrowLeft, ArrowRight, EllipsisVertical } from "lucide-react";
import TabControllerSectionTitle from "./tab-controller-section-title";
import { useAppSelector } from "@/shared/config/store/hooks";
import { selectActiveNoteId } from "@/entities/tabs/model/selectors";
import TabControllerSectionHistory from "./tab-controller-section-history";

export default function TabControllerSection() {
  const activeNoteId = useAppSelector(selectActiveNoteId);
  return (
    <div className="w-full flex items-center justify-between py-3 px-5">
      <TabControllerSectionHistory />
      <div>
        <TabControllerSectionTitle noteId={activeNoteId} />
      </div>
      <div>
        <Button size="icon-sm">
          <EllipsisVertical />
        </Button>
      </div>
    </div>
  );
}
