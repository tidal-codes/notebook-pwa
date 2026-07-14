import { FOLDERS_KEY } from "@/entities/folder/api/query.key";
import type { FolderEntity } from "@/entities/folder/model/types";
import { SearchableListDialog } from "@/shared/ui/searchable-list-dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMoveEntityDialogActions,
  useMoveEntityDialogData,
  useMoveEntityDialogOpen,
} from "./move-entity-dialog-provider";
import { useEffect, useState } from "react";
import type { MoveEntityDialogItem } from "./type";
import useMoveEntities from "./use-move-entities";
import useGetFoldersData from "@/entities/folder/model/use-get-folders-data";

export default function MoveEntityDialog() {
  const { open } = useMoveEntityDialogOpen();
  const { hideDialog } = useMoveEntityDialogActions();
  const getFoldersData = useGetFoldersData();
  const { defaultValues, onSubmit } = useMoveEntityDialogData();
  const { moveEntities } = useMoveEntities();
  const queryClient = useQueryClient();

  const [items, setitems] = useState<MoveEntityDialogItem[]>([]);

  useEffect(() => {
    setitems(getItems());
  }, [open]);

  function handleOnSelect(id: string | null) {
    moveEntities(defaultValues?.entities || [], id);
    onSubmit?.();
    hideDialog();
  }

  const getItems = (): MoveEntityDialogItem[] => {
    const excludedIds = new Set(
      defaultValues?.entities.map((entity) => entity.id),
    );

    return [
      {
        id: null,
        title: "/",
      },
      ...getFoldersData()
        .filter((folder) => !excludedIds.has(folder.id))
        .map((folder) => ({
          id: folder.id,
          title: folder.name,
        })),
    ];
  };
  return (
    <SearchableListDialog
      items={items}
      open={open}
      onOpenChange={(open) => !open && hideDialog()}
      onCreate={() => null}
      onSelect={handleOnSelect}
    />
  );
}
