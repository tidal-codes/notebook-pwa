import type { SelectedEntity } from "@/shared/model/types";
import { buildChildrenByParentIdMap } from "@/shared/lib/tree/build-children-map";
import { getDescendantsFromMap } from "@/shared/lib/tree/get-descendants";

export type TreeEntityType = "folder" | "note";

export interface TreeEntityRef {
  id: string;
  parent_id: string | null;
  type: TreeEntityType;
}

export interface DeletionSet {
  folderIds: string[];
  noteIds: string[];
}

export function resolveDeletionSet(
  selectedItems: SelectedEntity[],
  allEntities: TreeEntityRef[],
): DeletionSet {
  const childrenByParentId = buildChildrenByParentIdMap(allEntities);

  const folderIds = new Set<string>();
  const noteIds = new Set<string>();

  const addToSet = (type: TreeEntityType, id: string) => {
    (type === "folder" ? folderIds : noteIds).add(id);
  };

  for (const selected of selectedItems) {
    addToSet(selected.type, selected.id);

    const descendants = getDescendantsFromMap(selected.id, childrenByParentId);
    for (const descendant of descendants) {
      addToSet(descendant.type, descendant.id);
    }
  }

  return {
    folderIds: Array.from(folderIds),
    noteIds: Array.from(noteIds),
  };
}
