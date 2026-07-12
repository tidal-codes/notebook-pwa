import { foldersQueryOptions } from "@/entities/folder/api/folder.queries";
import { useAppSelector } from "@/shared/config/store/hooks";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { selectIsFolderCollapsed } from "../model/explorer-preferences.selectors";
import useTreeItem from "../model/use-tree-item";
import TreeItem from "./tree-item";
import { FOLDER_MENU_ITEMS } from "../model/constants";
import { getGuideLineLeft } from "../lib/treeIndent";

interface Props {
  id: string;
  depth?: number;
  children: React.ReactNode;
}

export default function TreeFolderItem({ id, depth, children }: Props) {
  const { data: folder } = useQuery({
    ...foldersQueryOptions,
    select: (data) => data.find((f) => f.id === id),
  });

  const { onFolderToggle, menu, onTreeItemClick, rename, selection } =
    useTreeItem(FOLDER_MENU_ITEMS, "folder", id, folder?.name || "");
  const isCollapsed = useAppSelector(selectIsFolderCollapsed(id));
  if (!folder) return null;

  return (
    <Collapsible open={!isCollapsed} onOpenChange={onFolderToggle}>
      <CollapsibleTrigger asChild>
        <TreeItem
          id={id}
          title={folder.name}
          depth={depth}
          menu={menu}
          isActive={false}
          isFolder={true}
          rename={rename}
          selection={selection}
          isOpen={!isCollapsed}
          onItemClick={onTreeItemClick}
          onToggleOpen={onFolderToggle}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="relative">
          <span
            aria-hidden
            className="absolute top-0 bottom-0 w-px bg-border"
            style={{ left: getGuideLineLeft(depth || 0) }}
          />
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
