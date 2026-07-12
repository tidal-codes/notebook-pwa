import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible";
import TreeItem from "@/shared/ui/components/tree-item";
import { foldersQueryOptions } from "../api/folder.queries";
import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useAppSelector } from "@/shared/config/store/hooks";

interface Props {
  id: string;
  onFolderToggle: (id: string) => void;
  depth?: number;
  children: React.ReactNode;
}

export default function TreeFolderItem({
  id,
  children,
  onFolderToggle,
}: Props) {
  const { data: folder } = useQuery({
    ...foldersQueryOptions,
    select: (data) => data.find((f) => f.id === id),
  });
  const isCollapsed = useAppSelector(
    (state) => state.explorerPreferences.collapsedFolders[id],
  );
  if (!folder) return null;
  return (
    <Collapsible open={isCollapsed} onOpenChange={() => onFolderToggle(id)}>
      <CollapsibleTrigger asChild>
        <TreeItem />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}
