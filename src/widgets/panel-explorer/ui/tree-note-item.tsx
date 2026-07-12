import { notesQueryOptions } from "@/entities/note/api/note.queries";
import { useQuery } from "@tanstack/react-query";
import TreeItem from "./tree-item";
import useTreeItem from "../model/use-tree-item";
import { NOTE_MENU_ITEMS } from "../model/constants";

interface Props {
  id: string;
  depth?: number;
}

export default function TreeNoteItem({ id, depth }: Props) {
  const { data: note } = useQuery({
    ...notesQueryOptions,
    select: (notes) => notes.find((note) => note.id === id),
  });
  const { menu, onTreeItemClick, rename, selection } = useTreeItem(
    NOTE_MENU_ITEMS,
    "note",
    id,
    note?.name || "",
  );

  if (!note) return null;

  return (
    <TreeItem
      id={id}
      title={note.name}
      depth={depth}
      menu={menu}
      rename={rename}
      selection={selection}
      onItemClick={onTreeItemClick}
    />
  );
}
