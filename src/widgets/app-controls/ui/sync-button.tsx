import { Button } from "@/shared/ui/button";
import Tooltip from "@/shared/ui/tooltip";
import { RefreshCcw } from "lucide-react";
import { useCanSync } from "../use-can-sync";

export default function SyncButton() {
  const { canSync, message } = useCanSync();

  return (
    <Tooltip side="left" content={canSync ? "Sync" : message}>
      <div className="relative">
        {!canSync && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white"
          >
            !
          </span>
        )}

        <Button
          variant="ghost"
          size="icon-lg"
          className="text-muted-foreground"
          disabled={!canSync}
          aria-label={canSync ? "Sync" : message}
        >
          <RefreshCcw />
        </Button>
      </div>
    </Tooltip>
  );
}
