import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { itemClicked, shiftItemClicked } from "./explorer.slice";
import { toggleFolder } from "./explorer-preferences.slice";
import { selectIsSelectMode } from "./explorer.selectors";

import type { TreeEntity } from "@/shared/model/types";
import { useOrderedItemsRef } from "./ordered-items-context";
import { noteOpenedInActiveTab } from "@/entities/tabs/model/slice";
import useOpenNote from "@/features/tabs/use-open-note";

export function useTreeItemClick(id: string, type: TreeEntity) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const orderedItemsRef = useOrderedItemsRef();
  const { handleOpenNote } = useOpenNote();
  const isSelectMode = useAppSelector(selectIsSelectMode);

  const onFolderToggle = useCallback(() => {
    dispatch(toggleFolder(id));
  }, [dispatch, id]);

  const onTreeItemClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.shiftKey) {
        dispatch(
          shiftItemClicked({
            id,
            type,
            orderedItems: orderedItemsRef.current,
          }),
        );
        return;
      }

      if (!isSelectMode) {
        if (type === "folder") {
          onFolderToggle();
        } else {
          handleOpenNote(id, "ACTIVE_TAB");
        }
      }

      dispatch(itemClicked({ id, type }));
    },
    [dispatch, id, type, isSelectMode, navigate, onFolderToggle],
  );

  return { onTreeItemClick, onFolderToggle };
}
