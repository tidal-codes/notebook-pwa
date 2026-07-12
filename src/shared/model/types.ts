export interface BaseEntity {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string | number;
  updated_at: string | number;
  is_deleted: boolean;
  is_dirty: boolean;
}

// ------- MENU ---------
import type { ReactNode } from "react";

interface BaseEntry {
  className?: string;
}

export interface MenuActionEntry<
  TId extends string = string,
> extends BaseEntry {
  type: "item";
  id: TId;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  /** استایل قرمز، برای اکشن‌هایی مثل Delete */
  destructive?: boolean;
}

export interface MenuLabelEntry extends BaseEntry {
  type: "label";
  label: string;
}

export interface MenuSeparatorEntry extends BaseEntry {
  type: "separator";
}

export interface MenuCheckboxEntry<
  TId extends string = string,
> extends BaseEntry {
  type: "checkbox";
  id: TId;
  label: string;
  icon?: ReactNode;
  /** کاملاً کنترل‌شده — والد باید state رو نگه داره و اینجا پاس بده */
  checked: boolean;
  disabled?: boolean;
}

export interface MenuRadioGroupEntry<
  TId extends string = string,
> extends BaseEntry {
  type: "radio-group";
  /** شناسه‌ی خودِ گروه — برای تشخیص این‌که کدوم گروه توی onRadioChange تغییر کرده */
  groupId: string;
  /** id همون آیتمی که الان انتخاب‌شده */
  value: TId;
  label?: string;
  items: Array<{
    id: TId;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
  }>;
}

export interface MenuSubEntry<TId extends string = string> extends BaseEntry {
  type: "sub";
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** آیتم‌های داخل ساب‌منو — بازگشتی، خودشون هم می‌تونن sub داشته باشن */
  items: MenuEntry<TId>[];
  contentClassName?: string;
}

export type MenuEntry<TId extends string = string> =
  | MenuActionEntry<TId>
  | MenuLabelEntry
  | MenuSeparatorEntry
  | MenuCheckboxEntry<TId>
  | MenuRadioGroupEntry<TId>
  | MenuSubEntry<TId>;

/** کالبک‌های مشترک بین Dropdown و Context menu */
export interface MenuCallbacks<TId extends string = string> {
  /** فقط برای entryهای type: "item" صدا زده میشه */
  onSelect: (id: TId) => void;
  /** فقط برای entryهای type: "checkbox" صدا زده میشه */
  onCheckedChange?: (id: TId, checked: boolean) => void;
  /** فقط برای entryهای type: "radio-group" صدا زده میشه */
  onRadioChange?: (groupId: string, value: TId) => void;
}
// ----------------------

export type TreeEntity = "folder" | "note";
