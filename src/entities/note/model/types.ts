import type { BaseEntity } from "@/shared/model/types";

export interface NoteEntity extends BaseEntity {
  type: "note";
  content : string;
  emoji: string | null;
}
