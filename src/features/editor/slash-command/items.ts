import type { Editor, Range } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Code2,
  type LucideIcon,
} from "lucide-react";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  command: (props: { editor: Editor; range: Range }) => void;
}

export const slashCommandItems: SlashCommandItem[] = [
  {
    title: "Text",
    description: "متن ساده",
    icon: Pilcrow,
    keywords: ["text", "paragraph", "p", "متن"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "عنوان بزرگ",
    icon: Heading1,
    keywords: ["h1", "heading1", "title"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run(),
  },
  {
    title: "Heading 2",
    description: "عنوان متوسط",
    icon: Heading2,
    keywords: ["h2", "heading2"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run(),
  },
  {
    title: "Heading 3",
    description: "عنوان کوچک",
    icon: Heading3,
    keywords: ["h3", "heading3"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run(),
  },
  {
    title: "Heading 4",
    description: "عنوان کوچک‌تر",
    icon: Heading4,
    keywords: ["h4", "heading4"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 4 })
        .run(),
  },
  {
    title: "Heading 5",
    description: "عنوان ریز",
    icon: Heading5,
    keywords: ["h5", "heading5"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 5 })
        .run(),
  },
  {
    title: "Heading 6",
    description: "کوچک‌ترین عنوان",
    icon: Heading6,
    keywords: ["h6", "heading6"],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 6 })
        .run(),
  },
  {
    title: "Bullet List",
    description: "لیست نقطه‌ای",
    icon: List,
    keywords: ["bullet", "list", "ul", "لیست"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "لیست شماره‌دار",
    icon: ListOrdered,
    keywords: ["numbered", "ordered", "ol", "list"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Quote",
    description: "نقل قول",
    icon: Quote,
    keywords: ["quote", "blockquote"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "بلاک کد",
    icon: Code2,
    keywords: ["code", "codeblock"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Divider",
    description: "خط جداکننده",
    icon: Minus,
    keywords: ["divider", "hr", "line", "separator", "خط"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];
