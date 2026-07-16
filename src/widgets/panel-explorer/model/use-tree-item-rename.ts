import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { cancelRenaming } from "./explorer.slice";
import { selectIsRenamingById } from "./explorer.selectors";
import useRenameEntity from "@/features/entity/rename-entity/use-rename-entity";
import type { EntityItemRenameProps } from "../ui/tree-item";
import type { TreeEntity } from "@/shared/model/types";

export function useTreeItemRename(
  id: string,
  type: TreeEntity,
  title: string,
  parent_id: string | null,
): EntityItemRenameProps {
  const dispatch = useAppDispatch();
  const { renameEntity } = useRenameEntity(id, type);

  const isRenaming = useAppSelector((state) => selectIsRenamingById(state, id));

  const onCancel = useCallback(() => {
    dispatch(cancelRenaming());
  }, [dispatch, title]);

  const onCommit = useCallback(
    (value: string) => {
      renameEntity({ newName: value, oldName: title, parent_id });
      dispatch(cancelRenaming());
    },
    [dispatch, renameEntity, title, parent_id],
  ); 

  return useMemo(
    () => ({ isRenaming, onCancel, onCommit }),
    [isRenaming, onCancel, onCommit],
  );
}
