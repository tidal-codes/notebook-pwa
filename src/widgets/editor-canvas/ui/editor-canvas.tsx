import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "../editor.css";

export default function EditorCanvas() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],

    content: "",

    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="px-6 h-full">
      <EditorContent
        editor={editor}
        className="prose prose-neutral max-w-none outline-none h-full"
      />
    </div>
  );
}

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
// import "../editor.css";

export default function EditorCanvas() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],

    content: "",

    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="px-6 h-full">
      <EditorContent
        editor={editor}
        className="prose prose-neutral max-w-none outline-none h-full"
      />
    </div>
  );
}
