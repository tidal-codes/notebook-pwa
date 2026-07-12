import { useCallback, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { cancelRenaming } from "./explorer.slice";
import { selectIsRenamingById } from "./explorer.selectors";
import useRenameEntity from "@/features/rename-entity/use-rename-entity";
import type { PanelItemType } from "@/widgets/notes-panel/model";
import type { EntityItemRenameProps } from "../ui/tree-item";

export function useTreeItemRename(
  id: string,
  type: PanelItemType,
  title: string,
): EntityItemRenameProps {
  const dispatch = useAppDispatch();
  const { renameEntity } = useRenameEntity(id, type);

  const [value, setValue] = useState(title);
  const isRenaming = useAppSelector((state) => selectIsRenamingById(state, id));

  const onCancel = useCallback(() => {
    setValue(title); // فیکس: برگردوندن مقدار اصلی، نه خالی کردن
    dispatch(cancelRenaming());
  }, [dispatch, title]);

  const onCommit = useCallback(() => {
    renameEntity(value);
    dispatch(cancelRenaming());
  }, [dispatch, renameEntity, value]); // فیکس: value و renameEntity اضافه شدن

  return useMemo(
    () => ({ isRenaming, value, onChange: setValue, onCancel, onCommit }),
    [isRenaming, value, onCancel, onCommit],
  );
}
