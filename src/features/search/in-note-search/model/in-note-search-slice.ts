import type { RootState } from "@/shared/config/store/store";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface NoteSearchUiState {
  isOpen: boolean;
  term: string;
  matchCase: boolean;
}

interface NoteSearchTarget {
  noteId: string;
  tabId: string;
}

interface InNoteSearchState {
  byKey: Record<string, NoteSearchUiState>;
}

const defaultNoteSearchUiState: NoteSearchUiState = {
  isOpen: false,
  term: "",
  matchCase: false,
};

const initialState: InNoteSearchState = {
  byKey: {},
};

function makeSearchKey(noteId: string, tabId: string): string {
  return `${noteId}::${tabId}`;
}

const inNoteSearchSlice = createSlice({
  name: "inNoteSearch",
  initialState,
  reducers: {
    openSearch(state, action: PayloadAction<NoteSearchTarget>) {
      const key = makeSearchKey(action.payload.noteId, action.payload.tabId);
      const entry = state.byKey[key] ?? { ...defaultNoteSearchUiState };
      entry.isOpen = true;
      state.byKey[key] = entry;
    },

    closeSearch(state, action: PayloadAction<NoteSearchTarget>) {
      const key = makeSearchKey(action.payload.noteId, action.payload.tabId);
      const entry = state.byKey[key];
      if (entry) {
        entry.isOpen = false;
        entry.term = "";
      }
    },

    setSearchTerm(
      state,
      action: PayloadAction<NoteSearchTarget & { term: string }>,
    ) {
      const key = makeSearchKey(action.payload.noteId, action.payload.tabId);
      const entry = state.byKey[key] ?? { ...defaultNoteSearchUiState };
      entry.term = action.payload.term;
      entry.isOpen = true;
      state.byKey[key] = entry;
    },

    setMatchCase(
      state,
      action: PayloadAction<NoteSearchTarget & { matchCase: boolean }>,
    ) {
      const key = makeSearchKey(action.payload.noteId, action.payload.tabId);
      const entry = state.byKey[key] ?? { ...defaultNoteSearchUiState };
      entry.matchCase = action.payload.matchCase;
      state.byKey[key] = entry;
    },

    removeNoteSearchState(state, action: PayloadAction<NoteSearchTarget>) {
      const key = makeSearchKey(action.payload.noteId, action.payload.tabId);
      delete state.byKey[key];
    },
  },
});

export const {
  openSearch,
  closeSearch,
  setSearchTerm,
  setMatchCase,
  removeNoteSearchState,
} = inNoteSearchSlice.actions;

export default inNoteSearchSlice.reducer;

export const selectNoteSearchUi =
  (noteId: string, tabId: string) =>
  (state: RootState): NoteSearchUiState =>
    state.inNoteSearchReducer.byKey[makeSearchKey(noteId, tabId)] ??
    defaultNoteSearchUiState;
