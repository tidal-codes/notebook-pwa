import { EditorContent, useEditor, type Extensions } from "@tiptap/react";
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

export default function EditorCanvas() {
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    textDirection: "auto",
    onUpdate(props) {
      console.log(props.editor.getJSON());
    },
  });
  if (!editor) return null;
  return (
    <div className="editor-canvas prose prose-neutral dark:prose-invert">
      <EditorContent editor={editor} />
    </div>
  );
}
