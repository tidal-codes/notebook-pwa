import { useMemo } from "react";
import type { MenuEntry } from "@/shared/model/types";
import type { PanelItemType } from "@/widgets/notes-panel/model";
import { useTreeItemClick } from "./use-tree-item-click";
import { useTreeItemSelection } from "./use-tree-item-selection";
import { useTreeItemRename } from "./use-tree-item-rename";
import { useTreeItemMenu } from "./use-tree-item-menu";

export default function useTreeItem<T extends string>(
  menuItems: MenuEntry<T>[],
  type: PanelItemType,
  id: string,
  title: string,
) {
  const { onTreeItemClick, onFolderToggle } = useTreeItemClick(id, type);
  const selection = useTreeItemSelection(id);
  const rename = useTreeItemRename(id, type, title);
  const menu = useTreeItemMenu(menuItems, id, type, title);

  return useMemo(
    () => ({ onTreeItemClick, onFolderToggle, selection, rename, menu }),
    [onTreeItemClick, onFolderToggle, selection, rename, menu],
  );
}
