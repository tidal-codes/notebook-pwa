import { Button } from "@/shared/ui/button";
import { EllipsisVertical } from "lucide-react";
import TabControllerSectionTitle from "./tab-controller-section-title";
import TabControllerSectionHistory from "./tab-controller-section-history";

interface Props {
  noteId: string | null;
}

export default function TabControllerSection({ noteId }: Props) {

  return (
    <div className="w-full flex items-center justify-between py-3 px-5">
      <TabControllerSectionHistory />
      <div>
        <TabControllerSectionTitle noteId={noteId} />
      </div>
      <div>
        <Button size="icon-sm">
          <EllipsisVertical />
        </Button>
      </div>
    </div>
  );
}
