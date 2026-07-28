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
];

interface EditorCanvasProps {
  noteId: string;
  noteContent: JSONContent;
  onSave: (noteId: string, content: JSONContent) => void;
}

// محتوای در حال ذخیره همیشه همراه با شناسه‌ی نوتی که بهش تعلق داره نگه داشته میشه
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

  // برای تشخیص اینکه آیا تغییر noteId واقعاً سوییچ به نوت دیگه‌ست
  const activeNoteIdRef = useRef(noteId);

  // آینه‌ی ref از pendingContent - چون توی افکت سوییچ نیاز داریم به
  // *آخرین* مقدار به‌صورت synchronous دسترسی داشته باشیم، بدون اینکه
  // منتظر دیباونس بمونیم یا pendingContent رو dependency افکت سوییچ کنیم
  const pendingContentRef = useRef<PendingSave | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    textDirection: "auto",
    content: noteContent, // مقدار اولیه فقط در mount اول استفاده میشه
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

  // سوییچ نوت: قبل از هر چیز، اگه ادیت ذخیره‌نشده‌ای از نوت قبلی مونده،
  // همین الان (بدون صبر برای دیباونس) ذخیره‌ش کن - تا هیچ ادیتی گم نشه
  // و هیچ‌وقت محتوای نوت قبلی با آیدی نوت جدید قاطی نشه.
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

  // مسیر عادی: وقتی مقدار دیباونس‌شده (بعد از ۳۰۰ms سکون در تایپ) آماده شد
  useEffect(() => {
    if (debouncedContent === null) return;
    onSave(debouncedContent.noteId, debouncedContent.content);
    pendingContentRef.current = null;
    setPendingContent(null);
  }, [debouncedContent, onSave]);

  if (!editor) return null;

  return (
    <div className="editor-canvas prose prose-neutral dark:prose-invert">
      <SelectionToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
