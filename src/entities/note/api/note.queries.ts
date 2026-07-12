import { queryOptions, useQuery } from "@tanstack/react-query";
import { getNote, getNotes } from ".";
import { NOTES_KEY } from "./query.keys";


export const notesQueryOptions = queryOptions({
    queryKey : NOTES_KEY,
    queryFn : getNotes
})

export function useNotes() {
    return useQuery(notesQueryOptions);
}

export function useNote(id: string) {
    return useQuery({
        queryKey: [...notesQueryOptions.queryKey , id],
        queryFn: () => getNote(id),
        enabled: !!id,
    });
}
