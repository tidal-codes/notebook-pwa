import { queryOptions, useQuery } from "@tanstack/react-query";
import { getFolders } from ".";

export const foldersQueryOptions = queryOptions({
  queryKey: ["folders"],
  queryFn: getFolders,
});

export function useFolders() {
  return useQuery(foldersQueryOptions);
}