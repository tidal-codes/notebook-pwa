import type { ChildrenMap, Entity } from "../model/types";

export function getAllEntityChildren(folderId : string , childrenByParent : ChildrenMap) {
  const result: Entity[] = [];
  const children = childrenByParent.get(folderId) ?? [];

  for (const child of children) {
    result.push(child);

    if (child.type === "folder") {
      result.push(...getAllEntityChildren(child.id , childrenByParent));
    }
  }

  return result;
}
