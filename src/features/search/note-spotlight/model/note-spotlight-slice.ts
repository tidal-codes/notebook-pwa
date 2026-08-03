import type { RootState } from "@/shared/config/store/store";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SpotlightRequest {
  noteId: string;
  /** Character offsets into that note's plain text - same numbers `global-search` produces. */
  start: number;
  end: number;
}

interface NoteSpotlightState {
  pending: SpotlightRequest | null;
}

const initialState: NoteSpotlightState = {
  pending: null,
};

const noteSpotlightSlice = createSlice({
  name: "noteSpotlight",
  initialState,
  reducers: {
    /** Dispatched by the Search Panel when a result row is clicked. */
    requestSpotlight(state, action: PayloadAction<SpotlightRequest>) {
      state.pending = action.payload;
    },
    /** Dispatched by the target note's editor right after it consumes the request. */
    clearPendingSpotlight(state) {
      state.pending = null;
    },
  },
});

export const { requestSpotlight, clearPendingSpotlight } =
  noteSpotlightSlice.actions;
export default noteSpotlightSlice.reducer;

export const selectPendingSpotlight = (
  state: RootState,
): SpotlightRequest | null => state.noteSpotlightReducer.pending;
