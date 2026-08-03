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

interface UseInNoteSearchOptions {
  noteId: string;
  editor: Editor | null;
}

export function useInNoteSearch({ noteId, editor }: UseInNoteSearchOptions) {
  const dispatch = useDispatch();
  const ui = useSelector(selectNoteSearchUi(noteId));

  const [totalMatches, setTotalMatches] = useState(0);
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);

  // Derived counters - read straight from the ProseMirror plugin's own
  // state after every transaction.
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

  // Push whatever term/matchCase Redux has for THIS note into the editor's
  // extension - this is what actually makes the highlighting happen.
  useEffect(() => {
    if (!editor) return;
    editor.commands.setSearchTerm(ui.term, ui.matchCase);
  }, [editor, ui.term, ui.matchCase]);

  const open = useCallback(
    () => dispatch(openSearch({ noteId })),
    [dispatch, noteId],
  );

  const search = useCallback(
    (term: string, matchCase: boolean) => {
      dispatch(setSearchTerm({ noteId, term }));
      dispatch(setMatchCase({ noteId, matchCase }));
    },
    [dispatch, noteId],
  );

  const goToNext = useCallback(() => {
    editor?.commands.nextSearchMatch();
  }, [editor]);

  const goToPrevious = useCallback(() => {
    editor?.commands.previousSearchMatch();
  }, [editor]);

  const close = useCallback(() => {
    dispatch(closeSearch({ noteId }));
    editor?.commands.clearSearchHighlight();
  }, [dispatch, noteId, editor]);

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
