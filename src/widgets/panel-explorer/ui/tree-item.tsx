import React from "react";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";
import {
  ChevronRight,
  Ellipsis,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import { Checkbox } from "@/shared/ui/checkbox";
import EntityItemContextMenu from "./entity-item-context-menu";
import EntityItemDropdownMenu from "./entity-item-dropdown-menu";
import type { MenuEntry, TreeEntity } from "@/shared/model/types";
import { getItemPaddingLeft } from "../lib/treeIndent";
import EntityItemRenameInput from "./entity-item-rename-input";

export interface EntityItemSelectionProps {
  isSelected?: boolean;
  isSelectMode?: boolean;
  isSemiSelected?: boolean;
  onSelect?: () => void;
  onCheckToggle?: () => void;
}

export interface EntityItemRenameProps {
  isRenaming?: boolean;
  onCommit?: (value: string) => void;
  onCancel?: () => void;
}

export interface EntityItemMenuProps<T extends string> {
  items: MenuEntry<T>[];
  isContextMenuOpen?: boolean;
  isDropdownMenuOpen?: boolean;
  onContextMenuOpenChange?: (open: boolean) => void;
  onDropdownMenuOpenChange?: (open: boolean) => void;
  onAction: (actionId: T, entityId: string, entityType: TreeEntity) => void;
}

export interface EntityItemProps<T extends string> {
  id: string;
  title: string;
  isFolder?: boolean;
  isOpen?: boolean;
  isActive?: boolean;
  depth?: number;

  onItemClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleOpen?: () => void;

  selection: EntityItemSelectionProps;
  rename: EntityItemRenameProps;
  menu: EntityItemMenuProps<T>;
}

function EntityTypeIcon({
  isFolder,
  isOpen,
}: {
  isFolder: boolean;
  isOpen: boolean;
}) {
  if (isFolder) {
    return isOpen ? (
      <FolderOpen
        className="h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    ) : (
      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    );
  }

  return (
    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
  );
}

export default function EntityItem<T extends string>({
  id,
  title,
  isFolder = false,
  isOpen = false,
  isActive = false,
  depth = 0,
  onItemClick,
  onToggleOpen,
  selection = {},
  rename = {},
  menu,
}: EntityItemProps<T>) {
  const {
    isSelected = false,
    isSelectMode = false,
    isSemiSelected = false,
    onCheckToggle,
  } = selection;

  const {
    isRenaming = false,
    onCommit: onRenameCommit,
    onCancel: onRenameCancel,
  } = rename;

  const {
    items: menuItems,
    isContextMenuOpen = false,
    isDropdownMenuOpen = false,
    onContextMenuOpenChange,
    onDropdownMenuOpenChange,
    onAction: onMenuClick,
  } = menu;

  const isAnyMenuOpen = isContextMenuOpen || isDropdownMenuOpen;
  const entityLabel = isFolder ? "folder" : "note";

  function handleItemClick(e: React.MouseEvent<HTMLButtonElement>) {
    onItemClick?.(e);
  }

  function handleToggleOpen(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    onToggleOpen?.();
  }

  return (
    <EntityItemContextMenu
      entityId={id}
      entityType={entityLabel}
      dropdownMenuItems={menuItems}
      onSelect={onMenuClick}
      onOpenChange={onContextMenuOpenChange}
    >
      <div className="px-2">
        <div
          className={cn(
            "group relative flex h-8 items-center gap-1.5 rounded-md pr-2",
            "hover:bg-item-hover",
            isActive && "bg-accent",
            isSemiSelected && "bg-primary/10 hover:bg-primary/15",
            isSelected && "bg-primary/15 hover:bg-primary/20",
            isAnyMenuOpen && "ring-2 ring-ring",
            isRenaming && "ring-2 ring-primary",
          )}
        >
          {!isRenaming && (
            <Button
              variant="ghost"
              onClick={handleItemClick}
              aria-label={`Open ${entityLabel} ${title}`}
              className="absolute inset-0 h-full w-full justify-start rounded-md p-0 focus:ring-2 focus:ring-ring hover:bg-transparent"
            />
          )}

          <div
            className={cn(
              "relative z-10 flex min-w-0 flex-1 items-center gap-1.5",
              isRenaming ? "pointer-events-auto" : "pointer-events-none",
            )}
            style={{ paddingLeft: getItemPaddingLeft(depth) }}
          >
            <span
              className={cn(
                "pointer-events-auto overflow-hidden transition-all duration-200 ease-out",
                isSelectMode
                  ? "mr-1 w-5 scale-100 opacity-100"
                  : "mr-0 w-0 scale-75 opacity-0",
              )}
            >
              <Checkbox
                className="size-4.5"
                checked={isSelected}
                aria-label={`Select ${title}`}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => onCheckToggle?.()}
              />
            </span>

            {isFolder ? (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={handleToggleOpen}
                aria-label={isOpen ? "Collapse folder" : "Expand folder"}
                className="pointer-events-auto shrink-0 size-6"
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
                    isOpen && "rotate-90",
                  )}
                />
              </Button>
            ) : (
              <span
                aria-hidden
                className={buttonVariants({
                  size: "icon-sm",
                  variant: "ghost",
                })}
              />
            )}

            {isRenaming ? (
              <EntityItemRenameInput
                title={title}
                onCommit={(value) => onRenameCommit?.(value)}
                onCancel={onRenameCancel}
              />
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <EntityTypeIcon isFolder={isFolder} isOpen={isOpen} />
                <span
                  className="min-w-0 flex-1 truncate text-start text-sm"
                  title={title}
                >
                  {title}
                </span>
              </div>
            )}
          </div>

          {!isRenaming && (
            <EntityItemDropdownMenu
              entityId={id}
              entityType={entityLabel}
              onMenuClick={onMenuClick}
              dropdownMenuItems={menuItems}
              onOpenChange={onDropdownMenuOpenChange}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${title}`}
                className={cn(
                  "relative z-10 size-6 opacity-0 group-hover:opacity-100",
                  {
                    "opacity-100": isAnyMenuOpen,
                  },
                )}
              >
                <Ellipsis />
              </Button>
            </EntityItemDropdownMenu>
          )}
        </div>
      </div>
    </EntityItemContextMenu>
  );
}
