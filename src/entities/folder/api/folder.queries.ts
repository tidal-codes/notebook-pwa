import { queryOptions, useQuery } from "@tanstack/react-query";
import { getFolders } from ".";
import { FOLDERS_KEY } from "./query.key";
import type { FolderEntity } from "../model/types";

export const foldersQueryOptions = queryOptions<FolderEntity[]>({
  queryKey: FOLDERS_KEY,
  queryFn: getFolders,
});

export function useFolders() {
  return useQuery(foldersQueryOptions);
}