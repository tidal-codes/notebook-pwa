import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";

export type TreeNode =
  | {
      id: string;
      name: string;
      parent_id: string | null;
      flatOrder : number;
      type: "note";
    }
  | {
      id: string;
      name: string;
      type: "folder";
      flatOrder : number;
      parent_id: string | null;
      children: TreeNode[];
    };

export interface ExplorerType {
  lastAddedItemId: string | null;
  semiSelecteditem: {
    id: string;
    type: "note" | "folder";
  } | null;
  isSelectMode: boolean;
  selectedIds: string[];
  renamingId: string | null;
}

export type CommonMenuItemIds =
  | "MAKE_COPY"
  | "MOVE_TO"
  | "BOOKMARK"
  | "RENAME"
  | "DELETE";

export type NoteMenuItemIds = "OPEN_NEW_TAB" | "SELECT" | CommonMenuItemIds;

export type FolderMenuItemIds =
  | "NEW_NOTE"
  | "NEW_FOLDER"
  | "SEARCH_IN_FOLDER"
  | CommonMenuItemIds;

export type SortByType =
  | "FILE_NAME_ASC"
  | "FILE_NAME_DESC"
  | "MODIFIED_ASC"
  | "MODIFIED_DESC"
  | "CREATED_ASC"
  | "CREATED_DESC"
  | "CUSTOM";

export type Entity = FolderEntity | NoteEntity;
export type EntityMap = Map<string, Entity>;
export type ChildrenMap = Map<string | null, Entity[]>;
