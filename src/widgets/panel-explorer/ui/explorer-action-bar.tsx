import useAddNewEntity from "@/features/add-new-entity/model/use-add-new-entity";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  selectAllFoldersCallapsed,
  selectNotesSort,
} from "../model/explorer-preferences.selectors";
import type { FolderEntity } from "@/entities/folder/model/types";
import {
  setNotesSort,
  toggleAllFolders,
} from "../model/explorer-preferences.slice";
import type { SortByType } from "../model/types";
import Tooltip from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import {
  ChevronsDownUpIcon,
  ChevronsUpDown,
  Edit,
  FolderPlus,
} from "lucide-react";
import SortActionMenu from "./sort-action-menu";
import { itemAdded, startRenaming } from "../model/explorer.slice";
import type { PanelItemType } from "@/entities/explorer/model/types";

interface Props {
  isLoading: boolean;
  currentParentFolderId: string | null;
}

export default function ExplorerActionBar({
  isLoading,
  currentParentFolderId,
}: Props) {
  const { createItem } = useAddNewEntity();

  const queryClient = useQueryClient();

  const allFoldersCollapsed = useAppSelector(selectAllFoldersCallapsed);
  const sortBy = useAppSelector(selectNotesSort);
  const dispatch = useAppDispatch();

  function handleToggleFoldersCollapse() {
    const folderIds = (
      queryClient.getQueryData<FolderEntity[]>(["folders"]) || []
    ).map((folder) => folder.id);
    dispatch(toggleAllFolders(folderIds));
  }

  function handleChangeSort(sort: SortByType) {
    dispatch(setNotesSort(sort));
  }

  function onEntityCreated(type: PanelItemType, id: string) {
    dispatch(itemAdded(id));
    type === "folder" && dispatch(startRenaming(id));
  }
  return (
    <div className="w-full px-2 py-3">
      <div className="w-full flex items-center justify-center gap-2">
        <Tooltip content="add note" side="bottom">
          <Button
            size="icon-lg"
            onClick={() =>
              createItem("note", currentParentFolderId, onEntityCreated)
            }
            disabled={isLoading}
          >
            <Edit />
          </Button>
        </Tooltip>
        <Tooltip content="add folder" side="bottom">
          <Button
            size="icon-lg"
            onClick={() =>
              createItem("folder", currentParentFolderId, onEntityCreated)
            }
            disabled={isLoading}
          >
            <FolderPlus />
          </Button>
        </Tooltip>
        <SortActionMenu sortBy={sortBy} onSortByChange={handleChangeSort} />
        <Tooltip content={allFoldersCollapsed ? "collapse all" : "expand all"}>
          <Button size="icon-lg" onClick={handleToggleFoldersCollapse}>
            {allFoldersCollapsed ? <ChevronsDownUpIcon /> : <ChevronsUpDown />}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
