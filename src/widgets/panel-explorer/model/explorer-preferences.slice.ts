import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SortByType } from "./types";


interface ExplorerPreferencesState {
  allFoldersCollapsed: boolean;
  collapsedFolders: Record<string, boolean>;
  notesSort: SortByType;
}

const initialState: ExplorerPreferencesState = {
  allFoldersCollapsed: true,
  collapsedFolders: {},
  notesSort: "CREATED_ASC",
};

const explorerPreferencesSlice = createSlice({
  name: "explorerPreferences",

  initialState,

  reducers: {
    toggleFolder(state, action: PayloadAction<string>) {
      const folderId = action.payload;
      state.collapsedFolders[folderId] = !state.collapsedFolders[folderId];
    },
    toggleAllFoldersCollapsed(state) {
      state.allFoldersCollapsed = !state.allFoldersCollapsed;
    },

    openFolder(state, action: PayloadAction<string>) {
      state.collapsedFolders[action.payload] = false;
    },

    closeFolder(state, action: PayloadAction<string>) {
      state.collapsedFolders[action.payload] = true;
    },

    setNotesSort(state, action: PayloadAction<SortByType>) {
      state.notesSort = action.payload;
    },

    resetExplorerPreferences() {
      return initialState;
    },

    openAllFolders(state, action: PayloadAction<string[]>) {
      // console.log(action.payload)
      for (const folderId of action.payload) {
        state.collapsedFolders[folderId] = false;
      }
    },

    closeAllFolders(state, action: PayloadAction<string[]>) {
      for (const folderId of action.payload) {
        state.collapsedFolders[folderId] = true;
      }
    },
    toggleAllFolders(state, action: PayloadAction<string[]>) {
      const folderIds = action.payload;

      const allCollapsed = folderIds.every((id) => state.collapsedFolders[id]);

      if (allCollapsed) {
        for (const id of folderIds) {
          state.collapsedFolders[id] = false;
        }
      } else {
        for (const id of folderIds) {
          state.collapsedFolders[id] = true;
        }
      }
      state.allFoldersCollapsed = !state.allFoldersCollapsed;
    },
  },
});

export const {
  toggleFolder,
  toggleAllFoldersCollapsed,
  openFolder,
  closeFolder,
  setNotesSort,
  resetExplorerPreferences,
  openAllFolders,
  closeAllFolders,
  toggleAllFolders,
} = explorerPreferencesSlice.actions;

export default explorerPreferencesSlice.reducer;
