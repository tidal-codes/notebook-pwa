// slash-command.ts
import { Extension } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { suggestion } from "./suggestion"; // آبجکت واقعی با char / items / render
import type { SlashCommandItem } from "./items";

export interface SlashCommandOptions {
  suggestion: Omit<SuggestionOptions<SlashCommandItem>, "editor">;
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "SlashCommand",

  addOptions() {
    return {
      suggestion, // حالا واقعاً کانفیگ درست (char/items/render) است
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      }),
    ];
  },
});
