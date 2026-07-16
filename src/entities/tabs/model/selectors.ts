import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/config/store/store";

export const selectTabsState = (state: RootState) => state.tabs;

export const selectAllTabs = createSelector(
  selectTabsState,
  (state) => state.tabs,
);

export const selectActiveTabId = createSelector(
  selectTabsState,
  (state) => state.activeTabId,
);

export const selectActiveTab = createSelector(
  [selectAllTabs, selectActiveTabId],
  (tabs, activeTabId) => tabs.find((t) => t.id === activeTabId)!,
);

export const selectActiveEntry = createSelector(
  selectActiveTab,
  (tab) => tab.entries[tab.activeEntryIndex],
);

/** null یعنی الان یه نیو تب خالی نمایش داده می‌شه */
export const selectActiveNoteId = createSelector(
  selectActiveEntry,
  (entry) => entry.noteId,
);

export const selectIsActiveTabNewTab = createSelector(
  selectActiveNoteId,
  (noteId) => noteId === null,
);

export const selectCanStepBack = createSelector(
  selectActiveTab,
  (tab) => tab.activeEntryIndex > 0,
);

export const selectCanStepForward = createSelector(
  selectActiveTab,
  (tab) => tab.activeEntryIndex < tab.entries.length - 1,
);

export const makeSelectTabById = (tabId: string) =>
  createSelector(selectAllTabs, (tabs) => tabs.find((t) => t.id === tabId));