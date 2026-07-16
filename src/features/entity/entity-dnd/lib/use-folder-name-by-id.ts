import useGetFoldersData from "@/entities/folder/model/use-get-folders-data";

export function useFolderNameById() {
  const getFoldersData = useGetFoldersData();

  return (folderId: string): string | null => {
    const folders = getFoldersData();
    return folders.find((f) => f.id === folderId)?.name ?? null;
  };
}
