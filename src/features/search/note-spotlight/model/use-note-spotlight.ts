import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Editor } from "@tiptap/core";
import { findProseMirrorPositionForOffset } from "@/entities/note/lib/text-extraction";
import {
  clearPendingSpotlight,
  selectPendingSpotlight,
} from "./note-spotlight-slice";

interface UseNoteSpotlightOptions {
  noteId: string;
  editor: Editor | null;
}

export function useNoteSpotlight({
  noteId,
  editor,
}: UseNoteSpotlightOptions): void {
  const dispatch = useDispatch();
  const pending = useSelector(selectPendingSpotlight);
  const isSettingSpotlightRef = useRef(false);

  useEffect(() => {
    if (!editor || !pending || pending.noteId !== noteId) return;

    const from = findProseMirrorPositionForOffset(
      editor.state.doc,
      pending.start,
    );
    const to = findProseMirrorPositionForOffset(
      editor.state.doc,
      pending.end,
    );

    if (from !== null && to !== null && from < to) {
      isSettingSpotlightRef.current = true;


      editor.commands.setSpotlight(from, to);


      setTimeout(() => {
        // المنت رو فقط در داخل همین ادیتور خاص می‌گردیم
        const highlightedEl = editor.view.dom.querySelector(".note-spotlight");
        
        if (highlightedEl) {
          highlightedEl.scrollIntoView({
            behavior: "smooth",
            block: "center", 
            inline: "nearest"
          });
        }
      }, 50);


      setTimeout(() => {
        isSettingSpotlightRef.current = false;
      }, 250); 
    }

    dispatch(clearPendingSpotlight());
  }, [editor, pending, noteId, dispatch]);

  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => {
      if (isSettingSpotlightRef.current) return;
      editor.commands.clearSpotlight();
    };

    editor.on("focus", handleFocus);
    return () => {
      editor.off("focus", handleFocus);
    };
  }, [editor]);
}