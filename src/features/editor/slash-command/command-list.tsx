import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type KeyboardEvent,
} from "react";
import type { SlashCommandItem } from "./items";
import { cn } from "@/shared/lib/utils";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";

export interface CommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface CommandListHandle {
  onKeyDown: (props: {
    event: KeyboardEvent | React.KeyboardEvent | any;
  }) => boolean;
}

export const CommandList = forwardRef<CommandListHandle, CommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="w-52 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground shadow-xl">
          No Results
        </div>
      );
    }

    return (
        <ScrollArea className="h-70 w-52 rounded-lg border border-border bg-background p-1.5 shadow-xl">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-start transition-colors",
                  index === selectedIndex
                    ? "bg-item-hover text-foreground"
                    : "text-foreground/80 hover:bg-foreground/5",
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-foreground/5">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">{item.title}</span>
                  {/* <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span> */}
                </span>
              </button>
            );
          })}
          <ScrollBar />
        </ScrollArea>
    );
  },
);
CommandList.displayName = "CommandList";
