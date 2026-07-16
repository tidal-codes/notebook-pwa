import { notesQueryOptions } from "@/entities/note/api/note.queries";
import useRenameEntity from "@/features/entity/rename-entity/use-rename-entity";
import { Input } from "@/shared/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  noteId: string;
}

export default function NoteTitle({ noteId }: Props) {
  const { data: note } = useQuery({
    ...notesQueryOptions,
    select: (data) => data.find((note) => note.id === noteId),
  });

  const [draftTitle, setDraftTitle] = useState(note?.name ?? "");
  const { renameEntity } = useRenameEntity(noteId, "note");

  const isFinalizedRef = useRef(false);

  useEffect(() => {
    setDraftTitle(note?.name ?? "");
    isFinalizedRef.current = false;
  }, [noteId, note?.name]);

  const commitRename = useCallback(() => {
    if (isFinalizedRef.current || !note) return;
    isFinalizedRef.current = true;

    const trimmed = draftTitle.trim();

    if (!trimmed || trimmed === note?.name) {
      setDraftTitle(note?.name ?? "");
      return;
    }

    renameEntity({
      newName: trimmed,
      oldName: note?.name,
      parent_id: note?.parent_id,
    });
  }, [draftTitle, note?.name, renameEntity]);

  const handleBlur = useCallback(() => {
    commitRename();
  }, [commitRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitRename();
        e.currentTarget.blur();
      }

      if (e.key === "Escape") {
        e.preventDefault();
        isFinalizedRef.current = true; 
        setDraftTitle(note?.name ?? "");
        e.currentTarget.blur();
      }
    },
    [commitRename, note?.name],
  );

  const handleFocus = useCallback(() => {
    isFinalizedRef.current = false;
  }, []);

  if (!note) return null;

  return (
    <div className="w-full px-5 py-8">
      <Input
        className="w-full text-2xl! font-semibold h-12 bg-transparent dark:bg-transparent border-none outline-0 focus-visible:ring-0!"
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
