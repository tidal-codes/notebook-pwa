import { tabActivated } from "@/entities/tabs/model/slice";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { useCallback } from "react";

export default function useChangeActiveTab() {
  const dispatch = useAppDispatch();

  const handleChangeActiveTab = useCallback(
    (tabId: string) => {
      dispatch(tabActivated(tabId));
    },
    [dispatch],
  );

  return { handleChangeActiveTab };
}
