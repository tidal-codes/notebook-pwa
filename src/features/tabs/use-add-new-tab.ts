import { emptyTabCreated } from "@/entities/tabs/model/slice";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { useCallback } from "react";

export default function useAddNewTab() {
  const dispatch = useAppDispatch();

  const handleAddNewTab = useCallback(() => {
    dispatch(emptyTabCreated());
  }, [dispatch]);

  return { handleAddNewTab };
}
