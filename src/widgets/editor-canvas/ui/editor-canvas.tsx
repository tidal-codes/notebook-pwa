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
import { useAppSelector } from "@/shared/config/store/hooks";
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
  note: NoteEntity;
  onSave: (noteId: string, content: JSONContent) => void;
}

interface PendingSave {
  noteId: string;
  content: JSONContent;
}

interface ActiveNoteRef {
  id: string;
  version: number;
}

export default function EditorCanvas({ note, onSave }: EditorCanvasProps) {
  const { id: noteId, content: noteContent, version: noteVersion } = note;

  const [pendingContent, setPendingContent] = useState<PendingSave | null>(
    null,
  );
  const debouncedContent = useDebounce(pendingContent, 300);

  const activeNoteRef = useRef<ActiveNoteRef>({
    id: noteId,
    version: noteVersion,
  });
  const pendingContentRef = useRef<PendingSave | null>(null);
  // آخرین محتوایی که خودمون از طریق onSave فرستادیم - برای تشخیص echo
  const lastSavedContentRef = useRef<JSONContent | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    textDirection: "auto",
    content: noteContent,
    onUpdate(props) {
      const json = props.editor.getJSON();
      const value: PendingSave = {
        noteId: activeNoteRef.current.id,
        content: json,
      };
      pendingContentRef.current = value;
      setPendingContent(value);
    },
  });

  // سوییچ نوت یا آپدیت ورژن همون نوت (تغییر از بیرون) - این افکت باید
  // همیشه قبل از هوک‌های سرچ زیر بمونه، چون اون‌ها فرض می‌کنن
  // editor.state.doc همین الان محتوای نوتِ درست رو داره.
  useEffect(() => {
    if (!editor) return;

    const isSameNote = activeNoteRef.current.id === noteId;
    const isSameVersion = activeNoteRef.current.version === noteVersion;

    if (isSameNote && isSameVersion) return;

    if (!isSameNote && pendingContentRef.current !== null) {
      onSave(
        pendingContentRef.current.noteId,
        pendingContentRef.current.content,
      );
    }

    const isOwnEcho =
      isSameNote &&
      lastSavedContentRef.current !== null &&
      JSON.stringify(lastSavedContentRef.current) ===
        JSON.stringify(noteContent);

    activeNoteRef.current = { id: noteId, version: noteVersion };

    if (isOwnEcho) {
      return;
    }

    pendingContentRef.current = null;
    setPendingContent(null);
    editor.commands.setContent(noteContent, { emitUpdate: false });
  }, [noteId, noteVersion, noteContent, editor, onSave]);

  useEffect(() => {
    if (debouncedContent === null) return;
    lastSavedContentRef.current = debouncedContent.content;
    onSave(debouncedContent.noteId, debouncedContent.content);
    pendingContentRef.current = null;
    setPendingContent(null);
  }, [debouncedContent]);

  const tabId = useAppSelector(selectActiveTabId);
  const inNoteSearch = useInNoteSearch({ noteId, editor, tabId });
  useNoteSpotlight({ noteId, editor });

  if (!editor) return null;

  return (
    <div className="editor-canvas prose prose-neutral dark:prose-invert">
      <SelectionToolbar editor={editor} />
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
      <EditorContent editor={editor} />
    </div>
  );
}
