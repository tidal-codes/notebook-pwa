import { useCallback, useMemo, useState } from "react";
import { useAppDispatch } from "@/shared/config/store/hooks";
import { enterSelectModeFromMenu, startRenaming } from "./explorer.slice";
import { useConfirmDeleteDialogActions } from "@/features/delete-entity/confirm-delete-dialog-provider";
import type { MenuEntry } from "@/shared/model/types";
import type { EntityItemMenuProps } from "../ui/tree-item";

export function useTreeItemMenu<T extends string>(
  menuItems: MenuEntry<T>[],
  id: string,
  type: "folder" | "note",
  title: string,
): EntityItemMenuProps<T> {
  const dispatch = useAppDispatch();
  const { showDialog } = useConfirmDeleteDialogActions();

  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);

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
          // TODO
          // dispatch(createNote({ parentId: id }))
          break;

        case "NEW_FOLDER":
          // TODO
          // dispatch(createFolder({ parentId: id }))
          break;

        case "SEARCH_IN_FOLDER":
          // TODO
          // navigate(`/search?folder=${id}`)
          break;

        // ---------- Common ----------

        case "MAKE_COPY":
          // TODO
          // dispatch(duplicateEntity(id))
          break;

        case "MOVE_TO":
          // TODO
          // openMoveDialog(id)
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
