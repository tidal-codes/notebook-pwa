import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { NoteEntity } from "./types";
import { NOTES_KEY } from "../api/query.keys";

export default function useGetNotesData() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return (
      queryClient.getQueryData<NoteEntity[]>(NOTES_KEY)?.filter(note => !note.is_deleted) ||
      ([] as NoteEntity[])
    );
  }, [queryClient]);
}
