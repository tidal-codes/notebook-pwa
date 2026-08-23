import { useEffect } from "react";
import { useCanSync } from "@/widgets/app-controls/use-can-sync";
import { getSyncManager } from "./create-sync-manager";

export function useAutoSync() {
  const { canSync } = useCanSync();

  useEffect(() => {
    getSyncManager().setCanSync(canSync);
  }, [canSync]);


  useEffect(() => {
    return () => {
      getSyncManager().stopHeartbeat();
    };
  }, []);

}
