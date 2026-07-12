import type { ReactNode } from "react";
import type { MenuEntry } from "@/shared/model/types";
import ContextMenu from "@/shared/ui/context-menu";
import type { PanelItemType } from "@/widgets/notes-panel/model";

interface Props<T extends string> {
  entityId: string;
  entityType: PanelItemType;
  onSelect: (actionId: T, entityId: string, entityType: PanelItemType) => void;
  children: ReactNode;
  dropdownMenuItems: MenuEntry<T>[];
  onOpenChange: ((open: boolean) => void) | undefined;
}

export default function EntityItemContextMenu<T extends string>({
  children,
  entityId,
  entityType,
  dropdownMenuItems,
  onSelect,
  onOpenChange,
}: Props<T>) {
  return (
    <ContextMenu
      onOpenChange={onOpenChange}
      items={dropdownMenuItems}
      onSelect={(actionId) => onSelect(actionId, entityId, entityType)}
      trigger={children}
    />
  );
}
