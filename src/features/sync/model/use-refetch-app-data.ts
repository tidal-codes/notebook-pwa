import { FOLDERS_KEY } from "@/entities/folder/api/query.key";
import { NOTES_KEY } from "@/entities/note/api/query.keys";
import { useQueryClient } from "@tanstack/react-query";

export default function useRefetchAppData() {
    const queryClient = useQueryClient();

    async function refetchAppData() {
        queryClient.refetchQueries({ queryKey: NOTES_KEY });
        queryClient.refetchQueries({ queryKey: FOLDERS_KEY });
    }

    return { refetchAppData };
}