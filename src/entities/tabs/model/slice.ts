import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { TabEntry, Tab, TabsState } from "./types";

function createEmptyEntry(): TabEntry {
  return { noteId: null, scrollTop: 0, cursorPosition: 0 };
}

function createNoteEntry(noteId: string): TabEntry {
  return { noteId, scrollTop: 0, cursorPosition: 0 };
}

function createEmptyTab(): Tab {
  return {
    id: nanoid(),
    entries: [createEmptyEntry()],
    activeEntryIndex: 0,
  };
}

function createTabWithNote(noteId: string): Tab {
  return {
    id: nanoid(),
    entries: [createNoteEntry(noteId)],
    activeEntryIndex: 0,
  };
}

const initialTab = createEmptyTab();

const initialState: TabsState = {
  tabs: [initialTab],
  activeTabId: initialTab.id,
};

function findTab(state: TabsState, tabId: string): Tab | undefined {
  return state.tabs.find((t) => t.id === tabId);
}

function getActiveTab(state: TabsState): Tab {
  return findTab(state, state.activeTabId)!;
}

function pushNoteToTab(tab: Tab, noteId: string) {
  const currentEntry = tab.entries[tab.activeEntryIndex];

  if (currentEntry.noteId === noteId) return;

  const isBlankNewTab =
    tab.entries.length === 1 && tab.entries[0].noteId === null;

  if (isBlankNewTab) {
    tab.entries[0] = createNoteEntry(noteId);
    tab.activeEntryIndex = 0;
    return;
  }

  tab.entries = tab.entries.slice(0, tab.activeEntryIndex + 1);
  tab.entries.push(createNoteEntry(noteId));
  tab.activeEntryIndex = tab.entries.length - 1;
}

const tabs = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    // ---------- ایجاد و بستن تب ----------

    /** دکمه‌ی "+" توی نوار تب؛ یه تب کاملاً خالی (بدون noteId) می‌سازه و فعالش می‌کنه */
    emptyTabCreated: (state) => {
      const newTab = createEmptyTab();
      state.tabs.push(newTab);
      state.activeTabId = newTab.id;
    },

    /** فقط با اکشن مستقیم یوزر روی "باز کردن در تب جدید" صدا زده می‌شه */
    noteOpenedInNewTab: (state, action: PayloadAction<{ noteId: string }>) => {
      const newTab = createTabWithNote(action.payload.noteId);
      state.tabs.push(newTab);
      state.activeTabId = newTab.id;
    },

    tabClosed: (state, action: PayloadAction<string>) => {
      const closingIndex = state.tabs.findIndex((t) => t.id === action.payload);
      if (closingIndex === -1) return;

      state.tabs.splice(closingIndex, 1);

      if (state.tabs.length === 0) {
        const fresh = createEmptyTab();
        state.tabs.push(fresh);
        state.activeTabId = fresh.id;
        return;
      }

      if (state.activeTabId === action.payload) {
        const fallbackIndex = Math.min(closingIndex, state.tabs.length - 1);
        state.activeTabId = state.tabs[fallbackIndex].id;
      }
    },

    tabActivated: (state, action: PayloadAction<string>) => {
      if (findTab(state, action.payload)) {
        state.activeTabId = action.payload;
      }
    },

    // ---------- باز کردن نوت (کلیک عادی، نه open-in-new-tab) ----------

    noteOpenedInActiveTab: (
      state,
      action: PayloadAction<{ noteId: string }>,
    ) => {
      pushNoteToTab(getActiveTab(state), action.payload.noteId);
    },

    // ---------- ناوبری تاریخچه‌ی تب (دکمه‌ی back/forward) ----------

    tabHistoryStepped: (
      state,
      action: PayloadAction<{ direction: "back" | "forward" }>,
    ) => {
      const tab = getActiveTab(state);
      const nextIndex =
        action.payload.direction === "back"
          ? tab.activeEntryIndex - 1
          : tab.activeEntryIndex + 1;

      if (nextIndex < 0 || nextIndex >= tab.entries.length) return;
      tab.activeEntryIndex = nextIndex;
    },

    // ---------- self-healing: وقتی نوت یک entry دیگه وجود نداره ----------

    staleEntryCleared: (
      state,
      action: PayloadAction<{ tabId: string; entryIndex: number }>,
    ) => {
      const tab = findTab(state, action.payload.tabId);
      const entry = tab?.entries[action.payload.entryIndex];
      if (!entry) return;

      entry.noteId = null;
      entry.scrollTop = 0;
      entry.cursorPosition = 0;
    },

    // ---------- ذخیره‌ی اسکرول/کرسر ----------

    activeEntryViewStateUpdated: (
      state,
      action: PayloadAction<{ scrollTop: number; cursorPosition: number }>,
    ) => {
      const tab = getActiveTab(state);
      const entry = tab.entries[tab.activeEntryIndex];
      entry.scrollTop = action.payload.scrollTop;
      entry.cursorPosition = action.payload.cursorPosition;
    },

    // ---------- ورود مستقیم از URL ----------

    tabOpenedForDirectUrlNote: (
      state,
      action: PayloadAction<{ noteId: string }>,
    ) => {
      const newTab = createTabWithNote(action.payload.noteId);
      state.tabs.push(newTab);
      state.activeTabId = newTab.id;
    },

    // ---------- rehydration از localStorage ----------

    tabsRehydrated: (_state, action: PayloadAction<TabsState>) =>
      action.payload,
  },
});

export const {
  emptyTabCreated,
  noteOpenedInNewTab,
  tabClosed,
  tabActivated,
  noteOpenedInActiveTab,
  tabHistoryStepped,
  staleEntryCleared,
  activeEntryViewStateUpdated,
  tabOpenedForDirectUrlNote,
  tabsRehydrated,
} = tabs.actions;

export default tabs.reducer;
