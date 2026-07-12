import DropdownMenu from "@/shared/ui/dropdown-menu";
import type { SortByType } from "../model/types";
import SortActionMenuTrigger from "./sort-action-menu-trigger";
import { SortAsc } from "lucide-react";
import type { MenuEntry } from "@/shared/model/types";


interface Props {
  sortBy: SortByType;
  onSortByChange: (value: SortByType) => void;
}

export default function SortActionMenu({ sortBy, onSortByChange }: Props) {
  const sortMenuItems: MenuEntry<SortByType>[] = [
    {
      type: "radio-group",
      groupId: "sort",
      value: sortBy,
      items: [
        { id: "FILE_NAME_ASC", label: "File name (A to Z)" },
        { id: "FILE_NAME_DESC", label: "File name (Z to A)" },
      ],
    },
    { type: "separator" },
    {
      type: "radio-group",
      groupId: "sort",
      value: sortBy,
      items: [
        { id: "MODIFIED_ASC", label: "modified time (new to old)" },
        { id: "MODIFIED_DESC", label: "modified time (old to new)" },
      ],
    },
    { type: "separator" },
    {
      type: "radio-group",
      groupId: "sort",
      value: sortBy,
      items: [
        { id: "CREATED_ASC", label: "created time (new to old)" },
        { id: "CREATED_DESC", label: "created time (old to new)" },
      ],
    },
  ];

  return (
    <DropdownMenu<SortByType>
      items={sortMenuItems}
      onSelect={() => {}} // این منو item عادی نداره؛ چون onSelect اجباریه فعلاً no-op می‌مونه
      onRadioChange={(_groupId, value) => onSortByChange(value)}
      trigger={
        <SortActionMenuTrigger>
          <SortAsc />
        </SortActionMenuTrigger>
      }
    />
  );
}
