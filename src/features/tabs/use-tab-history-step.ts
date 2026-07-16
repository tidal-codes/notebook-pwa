import { tabHistoryStepped } from "@/entities/tabs/model/slice";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { useCallback } from "react";

export default function useTabHistoryStep() {
  const dispatch = useAppDispatch();
  const handleTabHistoryStep = useCallback(
    (direction: "back" | "forward") => {
      dispatch(tabHistoryStepped({ direction }));
    },
    [dispatch],
  );

  return { handleTabHistoryStep };
}
