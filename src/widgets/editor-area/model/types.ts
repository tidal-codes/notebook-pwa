export type Tab =
  | { type: "empty"; key: string }
  | {
      type: "note";
      key: string;
      noteId: string;
      scrollTop?: number;
      cursorPosition?: { line: number; ch: number };
    };

export interface NoteAreaState {
  tabs: Tab[];
}
