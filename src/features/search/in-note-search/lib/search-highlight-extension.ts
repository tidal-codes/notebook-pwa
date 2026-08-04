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
  /** [from, to] بازه‌ی هر مورد پیدا شده، به ترتیب داخل سند. */
  matchRanges: MatchRange[];
  activeMatchIndex: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** سند واقعی ProseMirror رو می‌گرده و بازه‌ی [from, to) هر occurrence رو برمی‌گردونه. */
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

/**
 * بازه‌های match رو تبدیل به DecorationSet واقعی می‌کنه.
 * همه‌ی match ها کلاس "search-match" (هایلایت سکندری) می‌گیرن،
 * فقط اونی که activeMatchIndex هست علاوه‌براون کلاس
 * "search-match--active" (هایلایت اصلی) رو هم می‌گیره.
 */
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

export const SearchHighlightExtension = Extension.create({
  name: "searchHighlight",

  addCommands() {
    return {
      /** ترم سرچ رو ست (یا جایگزین) می‌کنه و هایلایت رو روشن می‌کنه. */
      setSearchTerm:
        (term: string, matchCase: boolean = false) =>
        ({ tr, dispatch }: any) => {
          if (dispatch) {
            tr.setMeta(searchHighlightPluginKey, {
              type: "setTerm",
              term,
              matchCase,
            });
          }
          return true;
        },

      /**
       * match فعال رو یکی جلو می‌بره (با چرخش به اول).
       * توجه: هیچ اسکرولی اینجا انجام نمی‌شه - فقط meta ست می‌شه.
       * اسکرول‌کردن مسئولیت لایه‌ی React (هوک) بعد از اجرای این کامنده.
       */
      nextSearchMatch:
        () =>
        ({ state, tr, dispatch }: any) => {
          const pluginState = searchHighlightPluginKey.getState(
            state,
          ) as SearchHighlightState;
          if (!pluginState || pluginState.matchRanges.length === 0)
            return false;

          const nextIndex =
            (pluginState.activeMatchIndex + 1) % pluginState.matchRanges.length;

          if (dispatch) {
            tr.setMeta(searchHighlightPluginKey, {
              type: "setActiveIndex",
              index: nextIndex,
            });
          }
          return true;
        },

      /** match فعال رو یکی عقب می‌بره (با چرخش به آخر). */
      previousSearchMatch:
        () =>
        ({ state, tr, dispatch }: any) => {
          const pluginState = searchHighlightPluginKey.getState(
            state,
          ) as SearchHighlightState;
          if (!pluginState || pluginState.matchRanges.length === 0)
            return false;

          const count = pluginState.matchRanges.length;
          const previousIndex =
            (pluginState.activeMatchIndex - 1 + count) % count;

          if (dispatch) {
            tr.setMeta(searchHighlightPluginKey, {
              type: "setActiveIndex",
              index: previousIndex,
            });
          }
          return true;
        },

      /**
       * بعد از باز کردن نوت از نتایج سرچ گلوبال صدا زده می‌شه: با گرفتن
       * پوزیشن واقعی ProseMirror (تبدیل‌شده از offset متن ساده، از طریق
       * findProseMirrorPositionForOffset)، matchـی که این پوزیشن داخلشه
       * رو به‌عنوان "فعال" ست می‌کنه.
       */
      jumpToProseMirrorPosition:
        (proseMirrorPosition: number) =>
        ({ state, tr, dispatch }: any) => {
          const pluginState = searchHighlightPluginKey.getState(
            state,
          ) as SearchHighlightState;
          if (!pluginState) return false;

          const index = pluginState.matchRanges.findIndex(
            (range) =>
              proseMirrorPosition >= range.from &&
              proseMirrorPosition <= range.to,
          );
          if (index === -1) return false;

          if (dispatch) {
            tr.setMeta(searchHighlightPluginKey, {
              type: "setActiveIndex",
              index,
            });
          }
          return true;
        },

      /** هایلایت رو کاملاً خاموش می‌کنه (مثلاً وقتی نوار سرچ بسته می‌شه). */
      clearSearchHighlight:
        () =>
        ({ tr, dispatch }: any) => {
          if (dispatch) {
            tr.setMeta(searchHighlightPluginKey, { type: "clear" });
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

            if (meta?.type === "clear") {
              return {
                term: "",
                matchCase: false,
                decorations: DecorationSet.empty,
                matchRanges: [],
                activeMatchIndex: -1,
              };
            }

            // سند تغییر کرده (کاربر داره تایپ می‌کنه) ولی ترم سرچ هنوز
            // فعاله - دوباره اسکن کن تا پوزیشن‌ها/هایلایت‌ها درست بمونن.
            if (tr.docChanged && previousState.term) {
              const matchRanges = computeMatches(
                tr.doc,
                previousState.term,
                previousState.matchCase,
              );
              const activeMatchIndex =
                matchRanges.length === 0
                  ? -1
                  : Math.min(
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

            // چیز مرتبطی تغییر نکرده - فقط decoration های موجود رو
            // با mapping تراکنش هماهنگ کن.
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