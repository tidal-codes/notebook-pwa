import { useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  ChevronDown,
  Link2,
  Check,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

const TEXT_TYPES = [
  {
    label: "Text",
    action: (e: Editor) => e.chain().focus().setParagraph().run(),
    isActive: (e: Editor) => e.isActive("paragraph"),
  },
  {
    label: "Heading 1",
    action: (e: Editor) =>
      e.chain().focus().setNode("heading", { level: 1 }).run(),
    isActive: (e: Editor) => e.isActive("heading", { level: 1 }),
  },
  {
    label: "Heading 2",
    action: (e: Editor) =>
      e.chain().focus().setNode("heading", { level: 2 }).run(),
    isActive: (e: Editor) => e.isActive("heading", { level: 2 }),
  },
  {
    label: "Heading 3",
    action: (e: Editor) =>
      e.chain().focus().setNode("heading", { level: 3 }).run(),
    isActive: (e: Editor) => e.isActive("heading", { level: 3 }),
  },
  {
    label: "Heading 4",
    action: (e: Editor) =>
      e.chain().focus().setNode("heading", { level: 4 }).run(),
    isActive: (e: Editor) => e.isActive("heading", { level: 4 }),
  },
  {
    label: "Heading 5",
    action: (e: Editor) =>
      e.chain().focus().setNode("heading", { level: 5 }).run(),
    isActive: (e: Editor) => e.isActive("heading", { level: 5 }),
  },
  {
    label: "Heading 6",
    action: (e: Editor) =>
      e.chain().focus().setNode("heading", { level: 6 }).run(),
    isActive: (e: Editor) => e.isActive("heading", { level: 6 }),
  },
];

const COLORS = [
  { label: "Default", value: null },
  { label: "Blue", value: "#5b9dff" },
  { label: "Green", value: "#4ade80" },
  { label: "Yellow", value: "#facc15" },
  { label: "Red", value: "#f87171" },
  { label: "Purple", value: "#c084fc" },
];

export function SelectionToolbar({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [textTypeOpen, setTextTypeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  if (!editor) return null;

  const activeTextType =
    TEXT_TYPES.find((t) => t.isActive(editor))?.label ?? "Text";

  const applyLink = () => {
    if (linkValue.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkValue.trim() })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkOpen(false);
    setLinkValue("");
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 10 }}
      shouldShow={({ state, editor: ed }) => {
        const { from, to } = state.selection;
        return from !== to && !ed.isActive("codeBlock");
      }}
      className="z-1000"
    >
      <div className="max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background shadow-2xl">
        <ScrollArea className="w-full">
          <div className="flex w-max items-center gap-0.5 p-1">
            <Popover open={textTypeOpen} onOpenChange={setTextTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className="gap-1 px-2.5 hover:bg-item-hover"
                >
                  <span>{activeTextType}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-44 bg-background border p-1"
                sideOffset={10}
              >
                <div className="flex flex-col gap-0.5">
                  {TEXT_TYPES.map((t) => {
                    const active = t.isActive(editor);
                    return (
                      <button
                        key={t.label}
                        onClick={() => {
                          t.action(editor);
                          setTextTypeOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-item-hover",
                          active && "bg-accent/15 text-foreground",
                        )}
                      >
                        <span>{t.label}</span>
                        {active && <Check className="h-3.5 w-3.5 opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" />

            <Popover open={linkOpen} onOpenChange={setLinkOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={editor.isActive("link") ? "default" : "ghost"}
                  size="default"
                  className="gap-1.5 px-2.5 hover:bg-item-hover"
                  onClick={() =>
                    setLinkValue(editor.getAttributes("link").href ?? "")
                  }
                >
                  <Link2 className="h-4 w-4" />
                  <span>Link</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-72 bg-background p-2"
                sideOffset={10}
              >
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyLink();
                  }}
                >
                  <input
                    autoFocus
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    placeholder="https://example.com"
                    className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <Button type="submit" size="default" className="h-8 px-3 text-sm">
                    Save
                  </Button>
                </form>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" />

            <Popover open={colorOpen} onOpenChange={setColorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className="gap-0.5 px-2.5 font-semibold hover:bg-item-hover"
                >
                  Color <span className="text-xs opacity-70">AA</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="flex w-auto flex-row gap-1 bg-background p-1.5"
                sideOffset={10}
              >
                {COLORS.map((c) => (
                  <button
                    key={c.label}
                    title={c.label}
                    onClick={() => {
                      c.value
                        ? editor.chain().focus().setColor(c.value).run()
                        : editor.chain().focus().unsetColor().run();
                      setColorOpen(false);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border hover:bg-item-hover"
                    style={{ backgroundColor: c.value ?? "transparent" }}
                  />
                ))}
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" />

            <Button
              variant={editor.isActive("bold") ? "default" : "ghost"}
              size="icon"
              className="hover:bg-item-hover"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("italic") ? "default" : "ghost"}
              size="icon"
              className="hover:bg-item-hover"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("underline") ? "default" : "ghost"}
              size="icon"
              className="hover:bg-item-hover"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("strike") ? "default" : "ghost"}
              size="icon"
              className="hover:bg-item-hover"
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" />

            <Button
              variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
              size="icon"
              className="hover:bg-item-hover"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
              size="icon"
              className="hover:bg-item-hover"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
              size="icon"
              className="hover:bg-item-hover"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </div>
    </BubbleMenu>
  );
}