import { useConfirmDeleteDialogActions } from "@/features/entity/delete-entity/confirm-delete-dialog-provider";
import type { MenuEntry } from "@/shared/model/types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import DropdownMenu from "@/shared/ui/dropdown-menu";
import { Separator } from "@/shared/ui/separator";
import {
  EllipsisVerticalIcon,
  FolderPlus,
  FolderTree,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import {
  selectSelectedEntitiesList,
  selectSemiSelectedItem,
} from "../model/explorer.selectors";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { semiSelectedItemCleared } from "../model/explorer.slice";
import { useMoveEntityDialogActions } from "@/features/entity/move-entity/move-entity-dialog-provider";

interface Props {
  selectedCount: number;
  clearSelection: () => void;
}
type SelectionActionIds =
  | "NEW_FOLDER_WITH_SELECTION"
  | "MOVE_ITEMS"
  | "DELETE";

export default function ExplorerSelectionActionBar({
  selectedCount,
  clearSelection,
}: Props) {
  const { showDialog } = useConfirmDeleteDialogActions();
  const selectedItems = useAppSelector(selectSelectedEntitiesList);
  const semiSelectedItem = useAppSelector(selectSemiSelectedItem);

  const dispatch = useAppDispatch();

  const { showDialog: showMoveEntitiesDialog } = useMoveEntityDialogActions();

  const selectedActionsMenuItems = useMemo(
    (): MenuEntry<SelectionActionIds>[] => [
      {
        type: "item",
        id: "NEW_FOLDER_WITH_SELECTION",
        label: `new folder with selection (${selectedCount} items)`,
        icon: <FolderPlus />,
      },
      { type: "separator" },
      {
        type: "item",
        id: "MOVE_ITEMS",
        label: `move ${selectedCount} items to...`,
        icon: <FolderTree />,
      },
      { type: "separator" },
      {
        type: "item",
        id: "DELETE",
        label: "delete",
        icon: <Trash2 />,
        destructive: true,
      },
    ],
    [selectedCount],
  );

  const selectionActions: Record<SelectionActionIds, () => void> = {
    DELETE: () => {
      showDialog({
        defaultValues: { entities: selectedItems },
        onSubmit: () => {
          clearSelection();
          if (selectedItems.find((v) => v.id === semiSelectedItem?.id)) {
            dispatch(semiSelectedItemCleared());
          }
        },
      });
    },
    MOVE_ITEMS: () => {
      showMoveEntitiesDialog({
        defaultValues: {
          entities: selectedItems,
        },
        onSubmit: () => {
          clearSelection();
        },
      });
    },
  };

  // const handleDeleteA
  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <Button size="icon-sm" variant="ghost" onClick={clearSelection}>
          <XCircle className="text-muted-foreground" />
        </Button>
        <Separator orientation="vertical" />
        <div className="flex items-center gap-2">
          <Badge>{selectedCount}</Badge>
          <p>item selected</p>
        </div>
      </div>
      <div>
        <DropdownMenu
          items={selectedActionsMenuItems}
          onSelect={(action) => selectionActions[action]()}
          trigger={
            <Button className="text-muted-foreground" size="icon-sm" variant="ghost">
              <EllipsisVerticalIcon />
            </Button>
          }
        />
      </div>
    </div>
  );
}
