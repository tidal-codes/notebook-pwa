import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { itemClicked, shiftItemClicked } from "./explorer.slice";
import { toggleFolder } from "./explorer-preferences.slice";
import { selectIsSelectMode } from "./explorer.selectors";

import type { TreeEntity } from "@/shared/model/types";
import { useOrderedItemsRef } from "./ordered-items-context";

export function useTreeItemClick(id: string, type: TreeEntity) {
  const dispatch = useAppDispatch();
  const orderedItemsRef = useOrderedItemsRef();
  const isSelectMode = useAppSelector(selectIsSelectMode);

  const onFolderToggle = useCallback(() => {
    dispatch(toggleFolder(id));
  }, [dispatch, id]);

  const onTreeItemClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.shiftKey) {
        dispatch(
          shiftItemClicked({ id, type, orderedItems: orderedItemsRef.current }),
        );
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
