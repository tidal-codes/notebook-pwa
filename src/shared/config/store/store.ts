import { configureStore } from "@reduxjs/toolkit";
// import NotesPanelUiReducer from "@/widgets/notes-panel/model/notesPanel.slice";
import explorerPreferences from "@/widgets/panel-explorer/model/explorer-preferences.slice";
import explorer from "@/widgets/panel-explorer/model/explorer.slice";
import tabs from "@/entities/tabs/model/slice";


export const store = configureStore({
  reducer: {
    explorerPreferences,
    explorer,
    tabs
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
