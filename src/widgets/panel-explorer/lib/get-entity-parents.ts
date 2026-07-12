import type { FolderEntity } from "@/entities/folder/model/types";
import type { EntityMap } from "../model/types";

export function getEntityParents(id: string, byId: EntityMap): FolderEntity[] {
  const parents: FolderEntity[] = [];

  let current = byId.get(id);

  while (current?.parent_id) {
    const parent = byId.get(current.parent_id);

    if (!parent || parent.type !== "folder") break;

    parents.unshift(parent);
    current = parent;
  }

  return parents;
}
