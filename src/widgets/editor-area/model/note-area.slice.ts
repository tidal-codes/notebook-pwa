import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { NoteAreaState } from "./types";

const initialState: NoteAreaState = { tabs: [] };

const noteAreaSlice = createSlice({
  name: "noteArea",
  initialState,
  reducers: {
    addEmptyTab: {
      reducer: (state, action: PayloadAction<{ key: string }>) => {
        state.tabs.push({ type: "empty", key: action.payload.key });
      },
      prepare: () => ({ payload: { key: `new-tab:${nanoid()}` } }),
    },

    // جایگزینی محتوای تب اکتیو (تب خالی یا نوتِ فعلی) با نوت جدید
    setNoteOnTab: (
      state,
      action: PayloadAction<{ currentKey: string; noteId: string }>,
    ) => {
      const { currentKey, noteId } = action.payload;
      const index = state.tabs.findIndex((t) => t.key === currentKey);
      if (index === -1) return;
      // چون key عوض میشه (از empty-key یا noteId قبلی به noteId جدید)
      // باید کل آبجکت رو جایگزین کنیم، نه merge
      state.tabs[index] = { type: "note", key: noteId, noteId };
    },

    openNoteInNewTab: (state, action: PayloadAction<{ noteId: string }>) => {
      const { noteId } = action.payload;
      const exists = state.tabs.some((t) => t.key === noteId);
      if (exists) return; // دیگه نیازی به چک جدا نیست، خودِ reducer دیداپ می‌کنه
      state.tabs.push({ type: "note", key: noteId, noteId });
    },

    closeTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((t) => t.key !== action.payload);
    },
  },
});

export const { addEmptyTab, openNoteInNewTab, closeTab, setNoteOnTab } =
  noteAreaSlice.actions;

export default noteAreaSlice.reducer;
