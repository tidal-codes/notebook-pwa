export type TreeEntityType = "folder" | "note";

export interface TreeEntityRef {
  id: string;
  parent_id: string | null;
  type: TreeEntityType;
}

export interface SelectedEntity {
  id: string;
  type: TreeEntityType;
}

export interface DeletionSet {
  folderIds: string[];
  noteIds: string[];
}

/**
 * از روی آیتم‌های انتخاب‌شده و کل درخت موجود (فولدرها + نوت‌ها)،
 * مجموعه‌ی نهایی و بدون تکرار چیزهایی که باید حذف بشن رو محاسبه می‌کنه.
 * ترتیب selectedItems هیچ تاثیری روی نتیجه نداره.
 */
export function resolveDeletionSet(
  selectedItems: SelectedEntity[],
  allEntities: TreeEntityRef[],
): DeletionSet {
  const childrenByParentId = new Map<string, TreeEntityRef[]>();

  for (const entity of allEntities) {
    if (entity.parent_id === null) continue;
    const siblings = childrenByParentId.get(entity.parent_id);
    if (siblings) {
      siblings.push(entity);
    } else {
      childrenByParentId.set(entity.parent_id, [entity]);
    }
  }

  const folderIds = new Set<string>();
  const noteIds = new Set<string>();

  const addToSet = (type: TreeEntityType, id: string) => {
    (type === "folder" ? folderIds : noteIds).add(id);
  };

  for (const selected of selectedItems) {
    addToSet(selected.type, selected.id);

    const queue: string[] = [selected.id];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = childrenByParentId.get(currentId);
      if (!children) continue;

      for (const child of children) {
        addToSet(child.type, child.id);
        queue.push(child.id);
      }
    }
  }

  return {
    folderIds: Array.from(folderIds),
    noteIds: Array.from(noteIds),
  };
}
