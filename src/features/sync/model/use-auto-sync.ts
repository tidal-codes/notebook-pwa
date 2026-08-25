import { useEffect } from "react";
import { useCanSync } from "@/widgets/app-controls/use-can-sync";
import { getSyncManager } from "./create-sync-manager";
import useRefetchAppData from "./use-refetch-app-data";



export function useAutoSync() {
  const { canSync } = useCanSync();
  const { refetchAppData } = useRefetchAppData();



  useEffect(() => {
    getSyncManager(refetchAppData).setCanSync(canSync);
  }, [canSync]);


  useEffect(() => {
    return () => {
      getSyncManager(refetchAppData).stopHeartbeat();
    };
  }, []);

}
