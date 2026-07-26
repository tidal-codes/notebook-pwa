import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AppUIState {
  isAppSidebarOpen: boolean;
  isAppDrawerOpen: boolean;
}

const initialState: AppUIState = {
  isAppSidebarOpen: true,
  isAppDrawerOpen: false,
};
const appUISlice = createSlice({
  name: "appUI",
  initialState,
  reducers: {
    // Sidebar (Desktop)
    openAppSidebar(state) {
      state.isAppSidebarOpen = true;
    },

    closeAppSidebar(state) {
      state.isAppSidebarOpen = false;
    },

    toggleAppSidebar(state) {
      state.isAppSidebarOpen = !state.isAppSidebarOpen;
    },

    setAppSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isAppSidebarOpen = action.payload;
    },

    // Drawer (Mobile)
    openAppDrawer(state) {
      state.isAppDrawerOpen = true;
    },

    closeAppDrawer(state) {
      state.isAppDrawerOpen = false;
    },

    toggleAppDrawer(state) {
      state.isAppDrawerOpen = !state.isAppDrawerOpen;
    },

    setAppDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isAppDrawerOpen = action.payload;
    },
  },
});

export const {
  closeAppDrawer,
  closeAppSidebar,
  openAppDrawer,
  openAppSidebar,
  setAppDrawerOpen,
  setAppSidebarOpen,
  toggleAppDrawer,
  toggleAppSidebar,
} = appUISlice.actions;

export default appUISlice.reducer;
