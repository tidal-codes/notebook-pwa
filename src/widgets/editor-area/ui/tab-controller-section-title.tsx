import { notesQueryOptions } from "@/entities/note/api/note.queries";
import { useQuery } from "@tanstack/react-query";

interface Props {
  noteId: string | null;
}
export default function TabControllerSectionTitle({ noteId }: Props) {
  const { data: note } = useQuery({
    ...notesQueryOptions,
    enabled: !!noteId,
    select: (data) => data.find((note) => note.id === noteId),
  });

  return <p>{note?.name || "new tab"}</p>;
}
