

interface HasParent {
  id: string;
  parent_id: string | null;
}

export function buildChildrenByParentIdMap<T extends HasParent>(
  items: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();

  for (const item of items) {
    if (item.parent_id === null) continue;
    const siblings = map.get(item.parent_id);
    if (siblings) {
      siblings.push(item);
    } else {
      map.set(item.parent_id, [item]);
    }
  }

  return map;
}
