import type { FolderEntity } from "@/entities/folder/model/types";
import type { NoteEntity } from "@/entities/note/model/types";
import type { ChildrenMap, Entity } from "../model/types";


export function buildChildrenByParent(
  folders: FolderEntity[],
  notes: NoteEntity[],
): ChildrenMap {
  const childrenByParent: ChildrenMap = new Map();

  function addToParentBucket(entity: Entity) {
    const bucket = childrenByParent.get(entity.parent_id) ?? [];
    bucket.push(entity);
    childrenByParent.set(entity.parent_id, bucket);
  }

  for (const folder of folders) {
    addToParentBucket(folder);
  }

  for (const note of notes) {
    addToParentBucket(note);
  }

  return childrenByParent;
}
