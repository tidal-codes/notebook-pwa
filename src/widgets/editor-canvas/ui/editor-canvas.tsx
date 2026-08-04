import {
  EditorContent,
  useEditor,
  type Extensions,
  type JSONContent,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import "../editor.css";
import { SlashCommand } from "@/features/editor/slash-command/slash-command";
import { SelectionToolbar } from "@/features/editor/selection-toolbar";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

// --- اضافه شد -----------------------------------------------------------
import {
  SearchHighlightExtension,
  useInNoteSearch,
  // InNoteSearchToolbar,
} from "@/features/search/in-note-search";
import {
  SpotlightExtension,
  useNoteSpotlight,
} from "@/features/search/note-spotlight";
import { InNoteSearchToolbar } from "@/features/search/in-note-search/in-note-search-toolbar";
import { useKeyboardShortcut } from "@/shared/lib/use-keyboard-shortcut";
import { useAppDispatch, useAppSelector } from "@/shared/config/store/hooks";
import { openSearch } from "@/features/search/in-note-search/model/in-note-search-slice";
import { selectActiveTabId } from "@/entities/tabs/model/selectors";
// --------------------------------------------------------------------------

const extensions: Extensions = [
  StarterKit,
  Underline,
  TextStyle,
  Color,
  Highlight,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
  }),
  Placeholder.configure({
    placeholder: ({ editor: ed }) =>
      ed.isFocused
        ? "Press '/' for commands"
        : "Write something, or press '/' for commands...",
  }),
  SlashCommand,
  // --- اضافه شد -----------------------------------------------------------
  // این دو تا نیازی به config ندارن - رفتارشون کاملاً از طریق
  // editor.commands.xxx() از بیرون کنترل میشه، نه از طریق تنظیمات اینجا.
  SearchHighlightExtension,
  SpotlightExtension,
  // --------------------------------------------------------------------------
];

interface EditorCanvasProps {
  noteId: string;
  noteContent: JSONContent;
  onSave: (noteId: string, content: JSONContent) => void;
}

interface PendingSave {
  noteId: string;
  content: JSONContent;
}

export default function EditorCanvas({
  noteId,
  noteContent,
  onSave,
}: EditorCanvasProps) {
  const [pendingContent, setPendingContent] = useState<PendingSave | null>(
    null,
  );
  const debouncedContent = useDebounce(pendingContent, 300);

  const activeNoteIdRef = useRef(noteId);
  const pendingContentRef = useRef<PendingSave | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    textDirection: "auto",
    content: noteContent,
    onUpdate(props) {
      const json = props.editor.getJSON();
      const value: PendingSave = {
        noteId: activeNoteIdRef.current,
        content: json,
      };
      pendingContentRef.current = value;
      setPendingContent(value);
    },
  });

  // سوییچ نوت - این افکت باید همیشه قبل از هوک‌های سرچ زیر بمونه، چون
  // اون‌ها فرض می‌کنن editor.state.doc همین الان محتوای نوتِ درست رو داره.
  useEffect(() => {
    if (!editor) return;
    if (activeNoteIdRef.current === noteId) return;

    if (pendingContentRef.current !== null) {
      onSave(
        pendingContentRef.current.noteId,
        pendingContentRef.current.content,
      );
    }

    activeNoteIdRef.current = noteId;
    pendingContentRef.current = null;
    setPendingContent(null);

    editor.commands.setContent(noteContent, { emitUpdate: false });
  }, [noteId, noteContent, editor, onSave]);

  useEffect(() => {
    if (debouncedContent === null) return;
    onSave(debouncedContent.noteId, debouncedContent.content);
    pendingContentRef.current = null;
    setPendingContent(null);
  }, [debouncedContent, onSave]);

  const tabId = useAppSelector(selectActiveTabId);
  const inNoteSearch = useInNoteSearch({ noteId, editor, tabId });
  useNoteSpotlight({ noteId, editor });
  // --------------------------------------------------------------------------

  if (!editor) return null;

  return (
    <div className="editor-canvas prose prose-neutral dark:prose-invert">
      <SelectionToolbar editor={editor} />
      {/* --- اضافه شد ----------------------------------------------------- */}
      {inNoteSearch.isOpen && (
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center pt-3 z-100 bg-background py-2">
          <InNoteSearchToolbar
            term={inNoteSearch.term}
            matchCase={inNoteSearch.matchCase}
            totalMatches={inNoteSearch.totalMatches}
            activeMatchIndex={inNoteSearch.activeMatchIndex}
            onSearch={inNoteSearch.search}
            onNext={inNoteSearch.goToNext}
            onPrevious={inNoteSearch.goToPrevious}
            onClose={inNoteSearch.close}
            noteId={noteId}
            tabId={tabId}
          />
        </div>
      )}
      {/* ------------------------------------------------------------------ */}
      <EditorContent editor={editor} />
    </div>
  );
}
