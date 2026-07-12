
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { useCallback } from "react";

export default function useExplorer() {
  const dispatch = useAppDispatch();
  const selectedItemIds = useAppSelector(selectSelectedIds);
  const handleTreeFolderItemToggle = useCallback(() => {}, []);
  const handleTreeItemClick = useCallback(() => {}, []);

  return { selectedItemIds };
}
