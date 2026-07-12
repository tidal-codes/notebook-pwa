import { queryOptions, useQuery } from "@tanstack/react-query";
import { getFolders } from ".";
import { FOLDERS_KEY } from "./query.key";

export const foldersQueryOptions = queryOptions({
  queryKey: FOLDERS_KEY,
  queryFn: getFolders,
});

export function useFolders() {
  return useQuery(foldersQueryOptions);
}