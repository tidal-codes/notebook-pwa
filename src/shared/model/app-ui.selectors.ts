import type { RootState } from "../config/store/store";


export const selectIsAppSidebarOpen = (state: RootState) =>
  state.appUI.isAppSidebarOpen;

export const selectIsAppDrawerOpen = (state: RootState) =>
  state.appUI.isAppDrawerOpen;