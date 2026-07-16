// features/entity-drag-and-drop/lib/use-draggable-entity.ts
import type { TreeEntity } from "@/shared/model/types";
import { useDraggable } from "@dnd-kit/core";
import { useDraggingIds } from "../model/entity-dnd-provider";

interface Params {
  id: string;
  type: TreeEntity;
  name: string;
}

export function useDraggableEntity({ id, type, name }: Params) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { id, type, name },
  });

  const draggingIds = useDraggingIds();
  // هم خود آیتم گرب‌شده رو پوشش می‌ده، هم بقیه‌ی سلکت‌شده‌هایی که با هم دارن درگ می‌شن
  const isBeingDragged = isDragging || draggingIds.has(id);

  return { attributes, listeners, setNodeRef, isBeingDragged };
}