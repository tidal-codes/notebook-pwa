import { createContext, useContext, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import type { DraggingEntity } from "../model/types";
import { useFolderNameById } from "../lib/use-folder-name-by-id";
import EntityDragOverlayContent from "../ui/entity-drag-overlay-content";

interface DraggingContextValue {
  draggingIds: Set<string>;
}

const DraggingContext = createContext<DraggingContextValue>({
  draggingIds: new Set(),
});

export function useDraggingIds() {
  return useContext(DraggingContext).draggingIds;
}

interface Props {
  children: ReactNode;
  /** این استیت بیرون از این فیچر نگه‌داری می‌شه (widget/دیگر فیچر)، پس از بیرون تزریق می‌شه */
  selectedEntities: Record<string, DraggingEntity>;
  /** بعد از drop معتبر صدا زده می‌شه؛ منطق move و mutation مربوطه مسئولیت مصرف‌کننده‌ست، نه این فیچر */
  onMove: (entities: DraggingEntity[], targetFolderId: string) => void;
}

export default function EntityDragDropProvider({
  children,
  selectedEntities,
  onMove,
}: Props) {
  const getFolderName = useFolderNameById();

  const [draggingEntities, setDraggingEntities] = useState<DraggingEntity[]>(
    [],
  );
  const [overFolderId, setOverFolderId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DraggingEntity;
    const selectedList = Object.values(selectedEntities);
    const isPartOfSelection = Boolean(selectedEntities[data.id]);
    const isMultiSelectionDrag = isPartOfSelection && selectedList.length > 1;

    setDraggingEntities(isMultiSelectionDrag ? selectedList : [data]);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverFolderId((event.over?.id as string) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const targetFolderId = event.over?.id as string | undefined;

    if (targetFolderId && draggingEntities.length > 0) {
      onMove(draggingEntities, targetFolderId);
    }

    setDraggingEntities([]);
    setOverFolderId(null);
  }

  function handleDragCancel() {
    setDraggingEntities([]);
    setOverFolderId(null);
  }

  const draggingIds = new Set(draggingEntities.map((e) => e.id));

  return (
    <DraggingContext.Provider value={{ draggingIds }}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
        <DragOverlay>
          {draggingEntities.length > 0 ? (
            <EntityDragOverlayContent
              entities={draggingEntities}
              targetFolderName={
                overFolderId ? getFolderName(overFolderId) : null
              }
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </DraggingContext.Provider>
  );
}
