import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { itemClicked, shiftItemClicked } from "./explorer.slice";
import { toggleFolder } from "./explorer-preferences.slice";
import { selectIsSelectMode } from "./explorer.selectors";
import { useOrderedIdsRef } from "./ordered-ids-context";
import type { PanelItemType } from "@/widgets/notes-panel/model";

export function useTreeItemClick(id: string, type: PanelItemType) {
  const dispatch = useAppDispatch();
  const orderedIdsRef = useOrderedIdsRef();
  const isSelectMode = useAppSelector(selectIsSelectMode);

  const onFolderToggle = useCallback(() => {
    dispatch(toggleFolder(id));
  }, [dispatch, id]);

  const onTreeItemClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.shiftKey) {
        dispatch(shiftItemClicked({ id, orderedIds: orderedIdsRef.current }));
        return;
      }

      if (!isSelectMode && type === "folder") {
        onFolderToggle();
      }

      dispatch(itemClicked({ id, type }));
    },
    [dispatch, id, type, isSelectMode, onFolderToggle],
  );

  return { onTreeItemClick, onFolderToggle };
}
