import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";


declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    searchHighlight: {
      setSearchTerm: (term: string, matchCase?: boolean) => ReturnType;
      nextSearchMatch: () => ReturnType;
      previousSearchMatch: () => ReturnType;
      jumpToProseMirrorPosition: (pos: number) => ReturnType;
      clearSearchHighlight: () => ReturnType;
    };
  }
}

export const searchHighlightPluginKey = new PluginKey<SearchHighlightState>(
  "searchHighlight",
);

interface MatchRange {
  from: number;
  to: number;
}

interface SearchHighlightState {
  term: string;
  matchCase: boolean;
  decorations: DecorationSet;
  /** [from, to] ranges of every occurrence, in document order. */
  matchRanges: MatchRange[];
  activeMatchIndex: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Walks the real ProseMirror doc and returns every occurrence's [from, to). */
function computeMatches(
  doc: ProseMirrorNode,
  term: string,
  matchCase: boolean,
): MatchRange[] {
  if (!term.trim()) return [];

  const regex = new RegExp(escapeRegExp(term), matchCase ? "g" : "gi");
  const matches: MatchRange[] = [];

  doc.descendants((node, pos) => {
    if (!node.isText) return true;

    const text = node.text ?? "";
    regex.lastIndex = 0;
    let execResult: RegExpExecArray | null;

    while ((execResult = regex.exec(text)) !== null) {
      const from = pos + execResult.index;
      const to = from + execResult[0].length;
      matches.push({ from, to });
      if (execResult[0].length === 0) regex.lastIndex++;
    }

    return true;
  });

  return matches;
}

/** Turns match ranges into an actual DecorationSet, marking the active one differently. */
function buildDecorationSet(
  doc: ProseMirrorNode,
  matches: MatchRange[],
  activeMatchIndex: number,
): DecorationSet {
  if (matches.length === 0) return DecorationSet.empty;

  const decorations = matches.map((match, index) =>
    Decoration.inline(match.from, match.to, {
      class:
        index === activeMatchIndex
          ? "search-match search-match--active"
          : "search-match",
    }),
  );

  return DecorationSet.create(doc, decorations);
}

function scrollToMatch(
  view: { dispatch: (tr: any) => void; state: any },
  match: MatchRange,
) {
  const tr = view.state.tr.setSelection(
    view.state.selection.constructor.near(view.state.doc.resolve(match.from)),
  );
  view.dispatch(tr.scrollIntoView());
}

export const SearchHighlightExtension = Extension.create({
  name: "searchHighlight",

  addCommands() {
    return {
      /** Sets (or replaces) the active search term and turns highlighting on. */
      setSearchTerm:
        (term: string, matchCase: boolean = false) =>
        ({ tr, dispatch }: any) => {
          if (dispatch) {
            tr.setMeta(searchHighlightPluginKey, {
              type: "setTerm",
              term,
              matchCase,
            });
            dispatch(tr);
          }
          return true;
        },

      /** Moves the active match forward, wrapping around at the end. */
      nextSearchMatch:
        () =>
        ({ state, dispatch, view }: any) => {
          const pluginState = searchHighlightPluginKey.getState(
            state,
          ) as SearchHighlightState;
          if (!pluginState || pluginState.matchRanges.length === 0)
            return false;

          const nextIndex =
            (pluginState.activeMatchIndex + 1) % pluginState.matchRanges.length;

          if (dispatch) {
            const tr = state.tr.setMeta(searchHighlightPluginKey, {
              type: "setActiveIndex",
              index: nextIndex,
            });
            dispatch(tr);
          }

          scrollToMatch(view, pluginState.matchRanges[nextIndex]);
          return true;
        },

      /** Moves the active match backward, wrapping around at the start. */
      previousSearchMatch:
        () =>
        ({ state, dispatch, view }: any) => {
          const pluginState = searchHighlightPluginKey.getState(
            state,
          ) as SearchHighlightState;
          if (!pluginState || pluginState.matchRanges.length === 0)
            return false;

          const count = pluginState.matchRanges.length;
          const previousIndex =
            (pluginState.activeMatchIndex - 1 + count) % count;

          if (dispatch) {
            const tr = state.tr.setMeta(searchHighlightPluginKey, {
              type: "setActiveIndex",
              index: previousIndex,
            });
            dispatch(tr);
          }

          scrollToMatch(view, pluginState.matchRanges[previousIndex]);
          return true;
        },

      /**
       * Used right after opening a note from the global search results:
       * given the real ProseMirror position (converted from the plain-text
       * offset via `findProseMirrorPositionForOffset`), select the match
       * that contains it as "active" and scroll to it.
       */
      jumpToProseMirrorPosition:
        (proseMirrorPosition: number) =>
        ({ state, dispatch, view }: any) => {
          if (dispatch) {
            const tr = state.tr.setMeta(searchHighlightPluginKey, {
              type: "setActiveByPosition",
              pos: proseMirrorPosition,
            });
            dispatch(tr);
          }

          const pluginState = searchHighlightPluginKey.getState(
            state,
          ) as SearchHighlightState;
          const match = pluginState?.matchRanges.find(
            (range) =>
              proseMirrorPosition >= range.from &&
              proseMirrorPosition <= range.to,
          );
          if (match) scrollToMatch(view, match);
          return true;
        },

      /** Turns off highlighting entirely (e.g. when the find toolbar is closed). */
      clearSearchHighlight:
        () =>
        ({ tr, dispatch }: any) => {
          if (dispatch) {
            tr.setMeta(searchHighlightPluginKey, { type: "clear" });
            dispatch(tr);
          }
          return true;
        },
    } as any;
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<SearchHighlightState>({
        key: searchHighlightPluginKey,

        state: {
          init(): SearchHighlightState {
            return {
              term: "",
              matchCase: false,
              decorations: DecorationSet.empty,
              matchRanges: [],
              activeMatchIndex: -1,
            };
          },

          apply(tr, previousState): SearchHighlightState {
            const meta = tr.getMeta(searchHighlightPluginKey);

            if (meta?.type === "setTerm") {
              const matchRanges = computeMatches(
                tr.doc,
                meta.term,
                meta.matchCase,
              );
              const activeMatchIndex = matchRanges.length > 0 ? 0 : -1;
              return {
                term: meta.term,
                matchCase: meta.matchCase,
                matchRanges,
                activeMatchIndex,
                decorations: buildDecorationSet(
                  tr.doc,
                  matchRanges,
                  activeMatchIndex,
                ),
              };
            }

            if (meta?.type === "setActiveIndex") {
              return {
                ...previousState,
                activeMatchIndex: meta.index,
                decorations: buildDecorationSet(
                  tr.doc,
                  previousState.matchRanges,
                  meta.index,
                ),
              };
            }

            if (meta?.type === "setActiveByPosition") {
              const index = previousState.matchRanges.findIndex(
                (range) => meta.pos >= range.from && meta.pos <= range.to,
              );
              const activeMatchIndex =
                index >= 0 ? index : previousState.activeMatchIndex;
              return {
                ...previousState,
                activeMatchIndex,
                decorations: buildDecorationSet(
                  tr.doc,
                  previousState.matchRanges,
                  activeMatchIndex,
                ),
              };
            }

            if (meta?.type === "clear") {
              return {
                term: "",
                matchCase: false,
                decorations: DecorationSet.empty,
                matchRanges: [],
                activeMatchIndex: -1,
              };
            }

            // The document changed (user kept typing) but the search term
            // is still active - re-scan so positions/highlights stay correct.
            if (tr.docChanged && previousState.term) {
              const matchRanges = computeMatches(
                tr.doc,
                previousState.term,
                previousState.matchCase,
              );
              const activeMatchIndex = Math.min(
                previousState.activeMatchIndex,
                matchRanges.length - 1,
              );
              return {
                ...previousState,
                matchRanges,
                activeMatchIndex,
                decorations: buildDecorationSet(
                  tr.doc,
                  matchRanges,
                  activeMatchIndex,
                ),
              };
            }

            // Nothing relevant changed - map the existing decorations
            // through the transaction so they still line up positionally.
            return {
              ...previousState,
              decorations: previousState.decorations.map(tr.mapping, tr.doc),
            };
          },
        },

        props: {
          decorations(state) {
            const pluginState = searchHighlightPluginKey.getState(state);
            return pluginState?.decorations ?? DecorationSet.empty;
          },
        },
      }),
    ];
  },
});
