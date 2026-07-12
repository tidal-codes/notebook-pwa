// folder.mutations.ts
import { useOptimisticMutation } from "@/shared/lib/useOptimisticMutation";
import { createFolder, updateFolder, deleteFolder } from ".";
import { foldersQueryOptions } from "./folder.queries";
import type { FolderEntity } from "../model/types";

const FOLDERS_KEY = foldersQueryOptions.queryKey;

export function useCreateFolder() {
  return useOptimisticMutation<FolderEntity, FolderEntity[], FolderEntity>({
    mutationKey: ["create_folder"],
    queryKey: FOLDERS_KEY,
    mutationFn: (data: FolderEntity) => createFolder(data),
    optimisticUpdater(variables, oldData) {
      return [...(oldData ?? []), variables];
    },
  });
}

export function useUpdateFolder(onError?: () => void , onSuccess?: () => void) {
  return useOptimisticMutation({
    mutationKey: ["update_folder"],
    queryKey: FOLDERS_KEY,
    mutationFn: ({ id, data }: { id: string; data: Partial<FolderEntity> }) =>
      updateFolder(id, data),
    optimisticUpdater(variables, oldData: FolderEntity[]) {
      return oldData.map((folder) =>
        folder.id === variables.id ? { ...folder, ...variables.data } : folder,
      );
    },
    onError,
    onSuccess
  });
}

export function useDeleteFolder() {
  return useOptimisticMutation({
    mutationKey: ["delete_folder"],
    queryKey: FOLDERS_KEY,
    mutationFn: (id: string) => deleteFolder(id),
    optimisticUpdater(variables, oldData: FolderEntity[]) {
      return oldData.filter((folder) => folder.id !== variables);
    },
  });
}
