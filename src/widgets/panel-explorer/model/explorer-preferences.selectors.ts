import type { RootState } from "@/shared/config/store/store";



export const selectAllFoldersCallapsed = (state : RootState) => state.explorerPreferences.allFoldersCollapsed;

export const selectNotesSort = (state: RootState) =>
  state.explorerPreferences.notesSort;

export const selectCollapsedFolders = (state: RootState) =>
  state.explorerPreferences.collapsedFolders;

export const selectIsFolderCollapsed =
  (folderId: string) => (state: RootState) =>
    !!state.explorerPreferences.collapsedFolders[folderId];