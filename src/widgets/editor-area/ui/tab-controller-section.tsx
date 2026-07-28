import { Button } from "@/shared/ui/button";
import { EllipsisVertical } from "lucide-react";
import TabControllerSectionTitle from "./tab-controller-section-title";
import TabControllerSectionHistory from "./tab-controller-section-history";

interface Props {
  noteTitle: string | undefined;
}

export default function TabControllerSection({ noteTitle }: Props) {
  return (
    <div className="w-full flex items-center justify-between py-3 px-5">
      <TabControllerSectionHistory />
      <div>
        <TabControllerSectionTitle noteTitle={noteTitle} />
      </div>
      <div>
        <Button size="icon-sm" variant="ghost">
          <EllipsisVertical />
        </Button>
      </div>
    </div>
  );
}
