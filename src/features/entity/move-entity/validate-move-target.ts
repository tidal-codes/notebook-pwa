import { buildChildrenByParentIdMap } from "@/shared/lib/tree/build-children-map";
import { getDescendantsFromMap } from "@/shared/lib/tree/get-descendants";

export interface TreeEntityRef {
  id: string;
  parent_id: string | null;
}

export type MoveInvalidReason = "target-is-self" | "target-is-descendant";

export interface MoveValidationResult {
  isValid: boolean;
  reason?: MoveInvalidReason;
}

export function validateMoveTarget(
  entities: { id: string; type: "note" | "folder" }[],
  targetFolderId: string | null,
  allFolders: TreeEntityRef[],
): MoveValidationResult {
  if (targetFolderId === null) {
    return { isValid: true };
  }

  const movedFolderIds = entities
    .filter((e) => e.type === "folder")
    .map((e) => e.id);

  if (movedFolderIds.length === 0) {
    return { isValid: true };
  }

  if (movedFolderIds.includes(targetFolderId)) {
    return { isValid: false, reason: "target-is-self" };
  }

  const childrenByParentId = buildChildrenByParentIdMap(allFolders);

  for (const movedFolderId of movedFolderIds) {
    const descendants = getDescendantsFromMap(movedFolderId, childrenByParentId);
    if (descendants.some((descendant) => descendant.id === targetFolderId)) {
      return { isValid: false, reason: "target-is-descendant" };
    }
  }

  return { isValid: true };
}