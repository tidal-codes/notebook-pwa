import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { toggleItemChecked } from "./explorer.slice";
import {
  selectIsSelected,
  selectIsSelectMode,
  selectIsSemiSelected,
} from "./explorer.selectors";
import type { EntityItemSelectionProps } from "../ui/tree-item";

export function useTreeItemSelection(id: string): EntityItemSelectionProps {
  const dispatch = useAppDispatch();

  const isSelectMode = useAppSelector(selectIsSelectMode);
  const isSelected = useAppSelector((state) => selectIsSelected(state, id));
  const isSemiSelected = useAppSelector((state) =>
    selectIsSemiSelected(state, id),
  );

  const onCheckToggle = useCallback(() => {
    dispatch(toggleItemChecked(id));
  }, [dispatch, id]);

  return useMemo(
    () => ({ isSelected, isSelectMode, isSemiSelected, onCheckToggle }),
    [isSelected, isSelectMode, isSemiSelected, onCheckToggle],
  );
}
