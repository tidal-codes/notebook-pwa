import type { BaseEntity } from "@/shared/model/types";
import type { JSONContent } from "@tiptap/react";

export interface NoteEntity extends BaseEntity {
  type: "note";
  content : JSONContent;
  emoji: string | null;
}
