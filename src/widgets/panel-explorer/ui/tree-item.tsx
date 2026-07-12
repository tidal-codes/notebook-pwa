import React from "react";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";
import { CheckCircle2, ChevronRight, Ellipsis, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import EntityItemContextMenu from "./entity-item-context-menu";
import EntityItemDropdownMenu from "./entity-item-dropdown-menu";
import type { MenuEntry } from "@/shared/model/types";
import { getItemPaddingLeft } from "../lib/treeIndent";
import { InputGroup, InputGroupAddon } from "@/shared/ui/input-group";

/** استیت و اکشن‌های سلکشن (چک‌باکس / حالت انتخاب چندتایی) */
export interface EntityItemSelectionProps {
  isSelected?: boolean;
  isSelectMode?: boolean;
  isSemiSelected?: boolean;
  onSelect?: () => void;
  onCheckToggle?: () => void;
}

/** استیت و اکشن‌های رنیم — کاملاً کنترل‌شده، مقدار و تغییرش دست والده */
export interface EntityItemRenameProps {
  isRenaming?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onCommit?: () => void;
  onCancel?: () => void;
}

/** آیتم‌های منو + استیت بازبودن منوها — کنترل‌شده */
export interface EntityItemMenuProps<T extends string> {
  items: MenuEntry<T>[];
  isContextMenuOpen?: boolean;
  isDropdownMenuOpen?: boolean;
  onContextMenuOpenChange?: (open: boolean) => void;
  onDropdownMenuOpenChange?: (open: boolean) => void;
  onAction: (
    actionId: T,
    entityId: string,
    entityType: "folder" | "note",
  ) => void;
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
    onSelect,
    onCheckToggle,
  } = selection;

  const {
    isRenaming = false,
    value: renameValue,
    onChange: onRenameChange,
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

  const inputRef = useRef<HTMLInputElement>(null);
  const isAnyMenuOpen = isContextMenuOpen || isDropdownMenuOpen;
  const entityLabel = isFolder ? "folder" : "note";

  useEffect(() => {
    if (isRenaming) {
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.select();
      }
    }
  }, [isRenaming]);

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onRenameCancel?.();
      inputRef.current?.blur();
    }
  }

  function handleItemClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!isSelectMode) {
      onToggleOpen?.();
    }
    onSelect?.();
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
            "hover:bg-accent",
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
              className="absolute inset-0 h-full w-full justify-start rounded-md p-0 focus:ring-2 focus:ring-ring"
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
                  ? "w-5 opacity-100 scale-100 mr-1"
                  : "w-0 opacity-0 scale-75 mr-0",
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
                className="pointer-events-auto shrink-0"
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
              // نکته‌ی کلیدی: flex-1 min-w-0 روی خودِ InputGroup،
              // نه فقط روی Input داخلش — وگرنه InputGroup به‌جای shrink،
              // به اندازه‌ی محتوای طبیعیش (اینپوت + دکمه‌ها) عرض می‌گیره و overflow می‌ده
              <InputGroup className="min-w-0 flex-1 border-0 bg-transparent outline-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <Input
                  ref={inputRef}
                  value={renameValue ?? title}
                  onChange={(e) => onRenameChange?.(e.target.value)}
                  onBlur={() => onRenameCommit?.()}
                  onKeyDown={handleInputKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 min-w-0 flex-1 border-none bg-transparent px-1 text-sm outline-0 focus-visible:ring-0 dark:bg-transparent"
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameCancel?.();
                    }}
                  >
                    <XCircle className="text-destructive" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameCommit?.();
                    }}
                  >
                    <CheckCircle2 className="text-success" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            ) : (
              <span
                className="min-w-0 flex-1 truncate text-start text-sm"
                title={title}
              >
                {title}
              </span>
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
                className="relative z-10"
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
