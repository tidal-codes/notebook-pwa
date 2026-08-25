import { useOptimisticMutation } from "@/shared/lib/useOptimisticMutation";
import { NOTES_KEY } from "./query.keys";
import { updateNote, deleteNote, createNote } from ".";
import type { NoteEntity } from "../model/types";

export function useUpdateNote(
  onError?: () => void,
  onSuccess?: (variables?: { id: string; data: Partial<NoteEntity> }) => void,
) {
  return useOptimisticMutation({
    mutationKey: ["update_note"],
    queryKey: NOTES_KEY,
    mutationFn: ({ id, data }: { id: string; data: Partial<NoteEntity> }) =>
      updateNote(id, data),
    optimisticUpdater(variables, oldData: NoteEntity[]) {
      return oldData.map((note) =>
        note.id === variables.id ? { ...note, ...variables.data } : note,
      );
    },
    onError,
    onSuccess: (_, variables) => {
      onSuccess?.(variables);
    },
  });
}

export function useDeleteNote() {
  return useOptimisticMutation({
    mutationKey: ["delete_note"],
    queryKey: NOTES_KEY,
    mutationFn: (note: NoteEntity) => deleteNote(note.id, note),
    optimisticUpdater(variables, oldData: NoteEntity[]) {
      return oldData.filter((note) => note.id !== variables.id);
    },
  });
}

export function useCreateNote() {
  return useOptimisticMutation<NoteEntity, NoteEntity[], NoteEntity>({
    mutationKey: ["create_note"],
    queryKey: NOTES_KEY,
    mutationFn: (data: NoteEntity) => createNote(data),
    optimisticUpdater(variables, oldData) {
      return [...(oldData || []), variables];
    },
  });
}
