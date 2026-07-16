// features/entity-drag-and-drop/lib/use-droppable-folder.ts
import { useDroppable } from "@dnd-kit/core";
import { useDraggingIds } from "../model/entity-dnd-provider";


export function useDroppableFolder(folderId: string) {
  const draggingIds = useDraggingIds();

  const { setNodeRef, isOver } = useDroppable({
    id: folderId,
    disabled: draggingIds.has(folderId),
  });

  return { setNodeRef, isOver: isOver && !draggingIds.has(folderId) };
}