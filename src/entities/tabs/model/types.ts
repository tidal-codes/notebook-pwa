
export type TabNoteId = string | null;

export interface TabEntry {
  noteId: TabNoteId;
  scrollTop: number;
  cursorPosition: number;
}

export interface Tab {
  id: string;
  entries: TabEntry[];
  activeEntryIndex: number;
}

export interface TabsState {
  tabs: Tab[];
  activeTabId: string;
}