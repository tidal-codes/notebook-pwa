import { tabClosed } from "@/entities/tabs/model/slice";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { useCallback } from "react";

export default function useCloseTab() {
  const dispatch = useAppDispatch();

  const handleCloseTab = useCallback(
    (tabId: string) => {
      dispatch(tabClosed(tabId));
    },
    [dispatch],
  );

  return { handleCloseTab };
}
