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

export default function MoveEntityDialog() {
  const { open } = useMoveEntityDialogOpen();
  const { hideDialog } = useMoveEntityDialogActions();
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
      ...(queryClient.getQueryData<FolderEntity[]>(FOLDERS_KEY) ?? [])
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
