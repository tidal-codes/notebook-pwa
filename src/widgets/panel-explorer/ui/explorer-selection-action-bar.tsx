import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { XCircle } from "lucide-react";

interface Props {
  selectedCount: number;
  clearSelection: () => void;
}

export default function ExplorerSelectionActionBar({
  selectedCount,
  clearSelection,
}: Props) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <Button size="icon-lg" variant="ghost" onClick={clearSelection}>
          <XCircle  />
        </Button>
        <Separator orientation="vertical"/>
        <div className="flex items-center gap-2">
          <Badge>{selectedCount}</Badge>
          <p>selected items</p>
        </div>
      </div>
    </div>
  );
}
