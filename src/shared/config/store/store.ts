import { configureStore } from "@reduxjs/toolkit";
// import NotesPanelUiReducer from "@/widgets/notes-panel/model/notesPanel.slice";
import explorerPreferences from "@/widgets/panel-explorer/model/explorer-preferences.slice";
import explorer from "@/widgets/panel-explorer/model/explorer.slice";
import tabs from "@/entities/tabs/model/slice";
import appUI from "../../model/app-ui.store";
import { noteSpotlightReducer } from "@/features/search/note-spotlight";
import { inNoteSearchReducer } from "@/features/search/in-note-search";

export const store = configureStore({
  reducer: {
    explorerPreferences,
    explorer,
    tabs,
    appUI,
    noteSpotlightReducer,
    inNoteSearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
