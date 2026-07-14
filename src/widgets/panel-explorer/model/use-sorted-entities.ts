import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";
import { useMemo } from "react";
import type { SortByType } from "./types";
import { useAppSelector } from "@/shared/config/store/hooks";
import { selectNotesSort } from "./explorer-preferences.selectors";

type SortableEntity = FolderEntity | NoteEntity;

interface Params {
  folders: FolderEntity[];
  notes: NoteEntity[];
}

function getComparator(sortBy: SortByType) {
  switch (sortBy) {
    case "FILE_NAME_ASC":
      return (a: SortableEntity, b: SortableEntity) =>
        a.name.localeCompare(b.name);
    case "FILE_NAME_DESC":
      return (a: SortableEntity, b: SortableEntity) =>
        b.name.localeCompare(a.name);
    case "MODIFIED_ASC":
      return (a: SortableEntity, b: SortableEntity) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    case "MODIFIED_DESC":
      return (a: SortableEntity, b: SortableEntity) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    case "CREATED_ASC":
      return (a: SortableEntity, b: SortableEntity) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    case "CREATED_DESC":
      return (a: SortableEntity, b: SortableEntity) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    default:
      return () => 0;
  }
}

export function useSortedEntities({
  folders,
  notes,
}: Params): SortableEntity[] {
  const sortBy = useAppSelector(selectNotesSort);
  return useMemo(() => {
    const merged: SortableEntity[] = [...folders, ...notes].filter(
      (item) => !item.is_deleted,
    );

    return merged.sort(getComparator(sortBy));
  }, [folders, notes, sortBy]);
}
