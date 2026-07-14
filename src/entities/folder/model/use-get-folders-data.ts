import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { FOLDERS_KEY } from "../api/query.key";
import { type FolderEntity } from "./types";

export default function useGetFoldersData() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return (
      queryClient.getQueryData<FolderEntity[]>(FOLDERS_KEY)?.filter(folder => !folder.is_deleted) ||
      ([] as FolderEntity[])
    );
  }, [queryClient]);
}
