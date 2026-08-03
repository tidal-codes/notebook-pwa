import type { RootState } from "@/shared/config/store/store";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface NoteSearchUiState {
  isOpen: boolean;
  term: string;
  matchCase: boolean;
}

interface InNoteSearchState {
  byNoteId: Record<string, NoteSearchUiState>;
}

const defaultNoteSearchUiState: NoteSearchUiState = {
  isOpen: false,
  term: "",
  matchCase: false,
};

const initialState: InNoteSearchState = {
  byNoteId: {},
};

const inNoteSearchSlice = createSlice({
  name: "inNoteSearch",
  initialState,
  reducers: {
    /** User pressed e.g. Ctrl+F inside a note - opens an empty search bar. */
    openSearch(state, action: PayloadAction<{ noteId: string }>) {
      const entry = state.byNoteId[action.payload.noteId] ?? {
        ...defaultNoteSearchUiState,
      };
      entry.isOpen = true;
      state.byNoteId[action.payload.noteId] = entry;
    },

    /** User closed the in-note find bar (Escape / the ✕ button). */
    closeSearch(state, action: PayloadAction<{ noteId: string }>) {
      const entry = state.byNoteId[action.payload.noteId];
      if (entry) {
        entry.isOpen = false;
        entry.term = "";
      }
    },

    setSearchTerm(
      state,
      action: PayloadAction<{ noteId: string; term: string }>,
    ) {
      const entry = state.byNoteId[action.payload.noteId] ?? {
        ...defaultNoteSearchUiState,
      };
      entry.term = action.payload.term;
      entry.isOpen = true;
      state.byNoteId[action.payload.noteId] = entry;
    },

    setMatchCase(
      state,
      action: PayloadAction<{ noteId: string; matchCase: boolean }>,
    ) {
      const entry = state.byNoteId[action.payload.noteId] ?? {
        ...defaultNoteSearchUiState,
      };
      entry.matchCase = action.payload.matchCase;
      state.byNoteId[action.payload.noteId] = entry;
    },

    /** Optional cleanup - call this when a tab actually closes, to avoid `byNoteId` growing forever. */
    removeNoteSearchState(state, action: PayloadAction<{ noteId: string }>) {
      delete state.byNoteId[action.payload.noteId];
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
  (noteId: string) =>
  (state: RootState): NoteSearchUiState =>
    state.inNoteSearchReducer.byNoteId[noteId] ?? defaultNoteSearchUiState;
