import { X } from "lucide-react";
import type { Tab } from "../model/types";
import { notesQueryOptions } from "@/entities/note/api/note.queries";
import { useQuery } from "@tanstack/react-query";
import type { NoteEntity } from "@/entities/note/model/types";
import { Skeleton } from "@/shared/ui/skeleton";

interface Props {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
}

export default function TabItem({ tab, isActive, onClick, onClose }: Props) {
  return (
    <div onClick={onClick} data-active={isActive}>
      {tab.type === "empty" ? (
        <span className="text-muted-foreground">new tab</span>
      ) : (
        <NoteTabLabel noteId={tab.noteId} />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

function NoteTabLabel({ noteId }: { noteId: string }) {
  const { data: note, isLoading } = useQuery<NoteEntity[]>({
    ...notesQueryOptions,
    select: (notes) => notes.find((note) => note.id === noteId),
  });

  if (isLoading) return <Skeleton className="h-4 w-16" />;
  return <span>{note?.name || "بدون عنوان"}</span>;
}
