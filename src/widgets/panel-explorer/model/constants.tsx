import type { MenuEntry } from "@/shared/model/types";
import {
  FilePlus,
  BookCopy,
  FolderTree,
  Bookmark,
  CircleCheck,
  Edit3,
  Trash2,
  FolderPlus,
  Search,
} from "lucide-react";
import type { NoteMenuItemIds, FolderMenuItemIds } from "./types";

export const NOTE_MENU_ITEMS: MenuEntry<NoteMenuItemIds>[] = [
  {
    type: "item",
    id: "OPEN_NEW_TAB",
    label: "open in new tab",
    icon: <FilePlus />,
  },
  {
    type: "separator",
  },
  {
    type: "item",
    id: "MAKE_COPY",
    label: "make a copy",
    icon: <BookCopy />,
  },
  {
    type: "item",
    id: "MOVE_TO",
    label: "move file to ...",
    icon: <FolderTree />,
  },
  {
    type: "item",
    id: "BOOKMARK",
    label: "bookmark",
    icon: <Bookmark />,
  },
  {
    type: "item",
    id: "SELECT",
    label: "select",
    icon: <CircleCheck />,
  },
  {
    type: "separator",
  },
  {
    type: "item",
    id: "RENAME",
    label: "rename",
    icon: <Edit3 />,
  },
  {
    type: "item",
    id: "DELETE",
    label: "delete",
    destructive: true,
    icon: <Trash2 />,
  },
];

export const FOLDER_MENU_ITEMS: MenuEntry<FolderMenuItemIds>[] = [
  {
    type: "item",
    id: "NEW_NOTE",
    label: "new note",
    icon: <FilePlus />,
  },
  {
    type: "item",
    id: "NEW_FOLDER",
    label: "new folder",
    icon: <FolderPlus />,
  },
  {
    type: "item",
    id: "SEARCH_IN_FOLDER",
    label: "search in this folder",
    icon: <Search />,
  },
  {
    type: "separator",
  },
  {
    type: "item",
    id: "MAKE_COPY",
    label: "make a copy",
    icon: <BookCopy />,
  },
  {
    type: "item",
    id: "MOVE_TO",
    label: "move file to ...",
    icon: <FolderTree />,
  },
  {
    type: "item",
    id: "BOOKMARK",
    label: "bookmark",
    icon: <Bookmark />,
  },
  {
    type: "separator",
  },
  {
    type: "item",
    id: "RENAME",
    label: "rename",
    icon: <Edit3 />,
  },
  {
    type: "item",
    id: "DELETE",
    label: "delete",
    destructive: true,
    icon: <Trash2 />,
  },
];
