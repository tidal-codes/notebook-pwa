import { useEffect, useRef, useState } from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/shared/ui/button";
import Tooltip from "@/shared/ui/tooltip";
import { useCanSync } from "../use-can-sync";
import { useSyncStatus } from "@/features/sync/model/use-sync-status";
import { getSyncManager } from "@/features/sync/model/create-sync-manager";
import useRefetchAppData from "@/features/sync/model/use-refetch-app-data";

export default function SyncButton() {
  const { canSync, message } = useCanSync();
  const { refetchAppData } = useRefetchAppData();
  const status = useSyncStatus();

  const [isRotating, setIsRotating] = useState(false);

  // وقتی sync تمام شده ولی انیمیشن هنوز باید دور فعلی را کامل کند.
  const shouldStopAfterIterationRef = useRef(false);

  async function handleSync() {
    if (!canSync || isRotating || status === "syncing") return;

    setIsRotating(true);
    shouldStopAfterIterationRef.current = false;

    const res = await getSyncManager(refetchAppData).syncNow();

    console.log(res);
  }

  useEffect(() => {
    // اگر sync در حال انجام است، انیمیشن باید روشن بماند.
    if (status === "syncing") {
      setIsRotating(true);
      shouldStopAfterIterationRef.current = false;
      return;
    }

    // اگر sync تمام شده ولی انیمیشن هنوز در حال اجراست،
    // فقط علامت می‌زنیم که بعد از پایان دور فعلی متوقف شود.
    if (isRotating) {
      shouldStopAfterIterationRef.current = true;
    }
  }, [status, isRotating]);

  function handleAnimationIteration() {
    if (!shouldStopAfterIterationRef.current) return;

    shouldStopAfterIterationRef.current = false;
    setIsRotating(false);
  }

  const shouldShowStatusBadge =
    canSync && !isRotating && (status === "success" || status === "error");

  const badgeClassName = status === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <Tooltip side="left" content={canSync ? "Sync" : message}>
      <div className="relative">
        {/* فقط وقتی canSync=true باشد badge وضعیت sync نمایش داده می‌شود */}
        {shouldShowStatusBadge && (
          <span
            aria-hidden="true"
            className={`absolute -top-0.5 -right-0.5 z-10 h-2.5 w-2.5 rounded-full ${badgeClassName}`}
          />
        )}

        {/* badge مربوط به canSync=false */}
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
          disabled={!canSync || isRotating}
          aria-label={canSync ? "Sync" : message}
          onClick={handleSync}
        >
          <RefreshCcw
            onAnimationIteration={handleAnimationIteration}
            className={
              isRotating ? "animate-[spin_700ms_linear_infinite]" : undefined
            }
          />
        </Button>
      </div>
    </Tooltip>
  );
}
