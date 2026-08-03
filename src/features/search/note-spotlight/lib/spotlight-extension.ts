import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export const spotlightPluginKey = new PluginKey<SpotlightState>("spotlight");

interface SpotlightRange {
  from: number;
  to: number;
}

interface SpotlightState {
  range: SpotlightRange | null;
  decorations: DecorationSet;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    spotlight: {
      /** Turns the highlight on for a specific range. */
      setSpotlight: (from: number, to: number) => ReturnType;
      /** Turns the highlight off. */
      clearSpotlight: () => ReturnType;
    };
  }
}

function buildDecorationSet(
  doc: ProseMirrorNode,
  range: SpotlightRange | null,
): DecorationSet {
  // اگر بازه نال بود یا مقدار from و to برابر بود (طول صفر)، دکوریشن نساز
  if (!range || range.from >= range.to) return DecorationSet.empty;
  
  return DecorationSet.create(doc, [
    Decoration.inline(range.from, range.to, { class: "note-spotlight" }),
  ]);
}

export const SpotlightExtension = Extension.create({
  name: "spotlight",

  addCommands() {
    return {
      setSpotlight:
        (from: number, to: number) =>
        ({ dispatch, tr }: any) => {
          // جلوگیری از اجرای دستور برای بازه‌های نامعتبر
          if (from >= to) return false;

          if (dispatch) {
            // فقط متاداده اکستنشن را در تراکنش ست می‌کنیم
            // اسکرول کردن به سمت متن در سمت هوک React انجام می‌شود
            tr.setMeta(spotlightPluginKey, {
              type: "set",
              from,
              to,
            });
            dispatch(tr);
          }
          return true;
        },

      clearSpotlight:
        () =>
        ({ tr, dispatch }: any) => {
          if (dispatch) {
            tr.setMeta(spotlightPluginKey, { type: "clear" });
            dispatch(tr);
          }
          return true;
        },
    } as any;
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<SpotlightState>({
        key: spotlightPluginKey,

        state: {
          init(): SpotlightState {
            return { range: null, decorations: DecorationSet.empty };
          },

          apply(tr, previous): SpotlightState {
            const meta = tr.getMeta(spotlightPluginKey);

            // اگر دستور ساخت اسپات‌لایت دریافت شد
            if (meta?.type === "set") {
              const range = { from: meta.from, to: meta.to };
              return { range, decorations: buildDecorationSet(tr.doc, range) };
            }

            // اگر دستور پاک شدن اسپات‌لایت دریافت شد
            if (meta?.type === "clear") {
              return { range: null, decorations: DecorationSet.empty };
            }

            // اگر کاربر در حین وجود اسپات‌لایت، جای دیگری از داکیومنت تایپ کرد،
            // باید بازه اسپات‌لایت با تغییرات داکیومنت هماهنگ (Map) شود تا به هم نریزد
            if (tr.docChanged && previous.range) {
              const newFrom = tr.mapping.map(previous.range.from);
              const newTo = tr.mapping.map(previous.range.to);
              const range = { from: newFrom, to: newTo };
              
              return {
                range,
                decorations: previous.decorations.map(tr.mapping, tr.doc),
              };
            }

            return previous;
          },
        },

        props: {
          decorations(state) {
            return (
              spotlightPluginKey.getState(state)?.decorations ??
              DecorationSet.empty
            );
          },
        },
      }),
    ];
  },
});