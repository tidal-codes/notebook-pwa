import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Editor } from "@tiptap/core";
import { searchHighlightPluginKey } from "../lib/search-highlight-extension";
import {
  closeSearch,
  openSearch,
  selectNoteSearchUi,
  setMatchCase,
  setSearchTerm,
} from "./in-note-search-slice";
import { useKeyboardShortcut } from "@/shared/lib/use-keyboard-shortcut";

interface UseInNoteSearchOptions {
  noteId: string;
  tabId: string;
  editor: Editor | null;
}

function scrollToActiveMatch(editor: Editor) {
  setTimeout(() => {
    const activeEl = editor.view.dom.querySelector(".search-match--active");

    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, 50);
}

export function useInNoteSearch({
  noteId,
  tabId,
  editor,
}: UseInNoteSearchOptions) {
  const dispatch = useDispatch();
  const ui = useSelector(selectNoteSearchUi(noteId, tabId));

  const [totalMatches, setTotalMatches] = useState(0);
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);

  useEffect(() => {
    if (!editor) return;

    const syncFromPluginState = () => {
      const pluginState = searchHighlightPluginKey.getState(editor.state);
      if (!pluginState) return;
      setTotalMatches(pluginState.matchRanges.length);
      setActiveMatchIndex(pluginState.activeMatchIndex);
    };

    editor.on("transaction", syncFromPluginState);
    syncFromPluginState();

    return () => {
      editor.off("transaction", syncFromPluginState);
    };
  }, [editor]);

  useKeyboardShortcut({
    code: "KeyF",
    ctrl: true,
    callback: () => {
      dispatch(openSearch({ noteId, tabId }));
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setSearchTerm(ui.term, ui.matchCase);

    if (ui.term.trim()) {
      scrollToActiveMatch(editor);
    }
  }, [editor, ui.term, ui.matchCase]);

  const open = useCallback(
    () => dispatch(openSearch({ noteId, tabId })),
    [dispatch, noteId, tabId],
  );

  const search = useCallback(
    (term: string, matchCase: boolean) => {
      dispatch(setSearchTerm({ noteId, tabId, term }));
      dispatch(setMatchCase({ noteId, tabId, matchCase }));
    },
    [dispatch, noteId, tabId],
  );

  const goToNext = useCallback(() => {
    if (!editor) return;
    editor.commands.nextSearchMatch();
    scrollToActiveMatch(editor);
  }, [editor]);

  const goToPrevious = useCallback(() => {
    if (!editor) return;
    editor.commands.previousSearchMatch();
    scrollToActiveMatch(editor);
  }, [editor]);

  const close = useCallback(() => {
    dispatch(closeSearch({ noteId, tabId }));
    editor?.commands.clearSearchHighlight();
  }, [dispatch, noteId, tabId, editor]);

  return {
    isOpen: ui.isOpen,
    term: ui.term,
    matchCase: ui.matchCase,
    totalMatches,
    activeMatchIndex,
    open,
    search,
    goToNext,
    goToPrevious,
    close,
  };
}