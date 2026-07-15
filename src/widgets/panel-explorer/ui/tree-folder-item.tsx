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
import { useDraggableEntity } from "@/features/entity-dnd/lib/use-draggable-entity";
import { useDroppableFolder } from "@/features/entity-dnd/lib/use-dropable-folder";
import { useMergeRefs } from "@/features/entity-dnd/lib/use-merge-refs";

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
    useTreeItem({
      menuItems: FOLDER_MENU_ITEMS,
      type: "folder",
      id,
      parent_id: folder?.parent_id ?? null,
      title: folder?.name || "",
    });
  const isCollapsed = useAppSelector(selectIsFolderCollapsed(id));

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isBeingDragged,
  } = useDraggableEntity({ id, type: "folder", name: folder?.name ?? "" });
  const { setNodeRef: setDropRef, isOver } = useDroppableFolder(id);
  const setRefs = useMergeRefs(setDragRef, setDropRef);
  if (!folder) return null;

  return (
    <Collapsible open={!isCollapsed} onOpenChange={onFolderToggle}>
      <div
        ref={setRefs}
        {...attributes}
        {...listeners}
        data-dragging={isBeingDragged || undefined}
        data-drop-over={isOver || undefined}
        className="data-[dragging]:opacity-40 data-[drop-over]:bg-accent rounded-md"
      >
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
      </div>
    </Collapsible>
  );
}
