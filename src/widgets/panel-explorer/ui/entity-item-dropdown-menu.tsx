import type { MenuEntry, TreeEntity } from "@/shared/model/types";
import DropdownMenu from "@/shared/ui/dropdown-menu";
import type { ReactNode } from "react";

interface Props<T extends string> {
  entityId: string;
  entityType: TreeEntity;
  onMenuClick: (
    actionId: T,
    entityId: string,
    entityType: TreeEntity,
  ) => void;
  children: ReactNode;
  dropdownMenuItems: MenuEntry<T>[];
  onOpenChange: ((open: boolean) => void) | undefined;
}

export default function EntityItemDropdownMenu<T extends string>({
  children,
  entityId,
  entityType,
  dropdownMenuItems,
  onMenuClick,
  onOpenChange,
}: Props<T>) {
  return (
    <DropdownMenu
      onOpenChange={onOpenChange}
      items={dropdownMenuItems}
      onSelect={(actionId) => onMenuClick(actionId, entityId, entityType)}
      trigger={children}
    />
  );
}
