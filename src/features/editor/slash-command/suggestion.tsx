import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { CommandList, type CommandListHandle } from "./command-list";
import { slashCommandItems, type SlashCommandItem } from "./items";
import type { SuggestionOptions } from "@tiptap/suggestion";

export const suggestion: Omit<SuggestionOptions<SlashCommandItem>, "editor"> = {
  char: "/",
  startOfLine: false,
  items: ({ query }) => {
    const q = query.toLowerCase().trim();
    if (!q) return slashCommandItems;
    return slashCommandItems.filter((item) =>
      [item.title.toLowerCase(), ...item.keywords].some((k) => k.includes(q)),
    );
  },
  render: () => {
    let component: ReactRenderer<CommandListHandle>;
    let popup: TippyInstance[];

    return {
      onStart: (props) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        popup = tippy("body", {
          getReferenceClientRect: () => props.clientRect!() as DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
          theme: "slash-command",
          offset: [0, 8],
        });
      },
      onUpdate(props) {
        component.updateProps(props);
        if (!props.clientRect) return;
        popup?.[0]?.setProps({
          getReferenceClientRect: () => props.clientRect!() as DOMRect,
        });
      },
      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }
        return component.ref?.onKeyDown(props) ?? false;
      },
      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};
