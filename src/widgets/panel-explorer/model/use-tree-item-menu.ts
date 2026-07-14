import { useCallback, useMemo, useState } from "react";
import { useAppDispatch } from "@/shared/config/store/hooks";
import {
  enterSelectModeFromMenu,
  itemAdded,
  startRenaming,
} from "./explorer.slice";
import { useConfirmDeleteDialogActions } from "@/features/delete-entity/confirm-delete-dialog-provider";
import type { MenuEntry, TreeEntity } from "@/shared/model/types";
import type { EntityItemMenuProps } from "../ui/tree-item";
import useAddNewEntity from "@/features/add-new-entity/model/use-add-new-entity";
import useCloneEntity from "@/features/clone-entity/use-clone-entity";
import { useMoveEntityDialogActions } from "@/features/move-entity/move-entity-dialog-provider";

export function useTreeItemMenu<T extends string>(
  menuItems: MenuEntry<T>[],
  id: string,
  type: "folder" | "note",
  title: string,
): EntityItemMenuProps<T> {
  const dispatch = useAppDispatch();
  const { showDialog } = useConfirmDeleteDialogActions();
  const { showDialog: showMoveEntityDialog } = useMoveEntityDialogActions();
  const { createItem } = useAddNewEntity();
  const { cloneEntity } = useCloneEntity();

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);

  function onEntityCreated(type: TreeEntity, id: string) {
    dispatch(itemAdded(id));
    type === "folder" && dispatch(startRenaming(id));
  }

  const onAction = useCallback(
    (actionId: T) => {
      switch (actionId) {
        // ---------- Note ----------

        case "OPEN_NEW_TAB":
          // TODO
          // dispatch(openNoteInNewTab(id))
          break;

        case "SELECT":
          dispatch(enterSelectModeFromMenu({ id, type }));
          break;

        // ---------- Folder ----------

        case "NEW_NOTE":
          if (type === "folder") {
            createItem("note", id, onEntityCreated);
          }
          break;

        case "NEW_FOLDER":
          if (type === "folder") {
            createItem("folder", id, onEntityCreated);
          }
          break;

        case "SEARCH_IN_FOLDER":
          // TODO
          // navigate(`/search?folder=${id}`)
          break;

        // ---------- Common ----------

        case "MAKE_COPY":
          cloneEntity(type, id, () => null);
          break;

        case "MOVE_TO":
          showMoveEntityDialog({
            defaultValues: {
              entities: [{ id, type }],
            },
          });
          break;

        case "BOOKMARK":
          // TODO
          // dispatch(toggleBookmark(id))
          break;

        case "RENAME":
          dispatch(startRenaming(id));
          break;

        case "DELETE": {
          showDialog({
            defaultValues: {
              entities: [{ id, type }],
            },
          });
          break;
        }
        default:
          break;
      }
    },
    [dispatch, showDialog, id, title, type],
  );

  return useMemo(
    () => ({
      items: menuItems,
      onAction,
      isContextMenuOpen,
      isDropdownMenuOpen,
      onContextMenuOpenChange: setIsContextMenuOpen,
      onDropdownMenuOpenChange: setIsDropdownMenuOpen,
    }),
    [menuItems, onAction, isContextMenuOpen, isDropdownMenuOpen],
  );
}
