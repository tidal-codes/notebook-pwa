import { useMemo } from "react";
import type { MenuEntry, TreeEntity } from "@/shared/model/types";
import { useTreeItemClick } from "./use-tree-item-click";
import { useTreeItemSelection } from "./use-tree-item-selection";
import { useTreeItemRename } from "./use-tree-item-rename";
import { useTreeItemMenu } from "./use-tree-item-menu";

type UseTreeItemProps<T extends string> = {
  menuItems: MenuEntry<T>[];
  type: TreeEntity;
  id: string;
  title: string;
  parent_id: string | null;
};

export default function useTreeItem<T extends string>({
  menuItems,
  type,
  id,
  title,
  parent_id,
}: UseTreeItemProps<T>) {
  const { onTreeItemClick, onFolderToggle } = useTreeItemClick(id, type);
  const selection = useTreeItemSelection(id);
  const rename = useTreeItemRename(id, type, title , parent_id);
  const menu = useTreeItemMenu(menuItems, id, type, title);

  return useMemo(
    () => ({
      onTreeItemClick,
      onFolderToggle,
      selection,
      rename,
      menu,
    }),
    [onTreeItemClick, onFolderToggle, selection, rename, menu],
  );
}
