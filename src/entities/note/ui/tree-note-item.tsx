import { useQuery } from "@tanstack/react-query";
import { notesQueryOptions } from "../api/note.queries";
import TreeItem from "@/shared/ui/components/tree-item";

interface Props {
  id: string;
  depth?: number;
}

export default function TreeNoteItem({ id, depth }: Props) {
  const { data: note } = useQuery({
    ...notesQueryOptions,
    select: (notes) => notes.find((note) => note.id === id),
  });

  if (!note) return null;

  return <TreeItem />;
}
