

import { buildChildrenByParentIdMap } from "./build-children-map";

interface HasParent {
  id: string;
  parent_id: string | null;
}


export function getDescendantsFromMap<T extends HasParent>(
  rootId: string,
  childrenByParentId: Map<string, T[]>,
): T[] {
  const result: T[] = [];
  const queue: string[] = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = childrenByParentId.get(currentId);
    if (!children) continue;

    for (const child of children) {
      result.push(child);
      queue.push(child.id);
    }
  }

  return result;
}

/**
 * نسخه‌ی راحت: وقتی فقط یه لیست ساده داری و map از قبل ساخته نشده
 * (همون getAllDescendants قبلی، حالا بر پایه‌ی helper مشترک)
 */
export function getAllDescendants<T extends HasParent>(
  items: T[],
  rootId: string,
): T[] {
  const childrenByParentId = buildChildrenByParentIdMap(items);
  return getDescendantsFromMap(rootId, childrenByParentId);
}