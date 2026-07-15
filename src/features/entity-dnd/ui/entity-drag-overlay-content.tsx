import type { DraggingEntity } from "../model/types";

interface Props {
  entities: DraggingEntity[];
  targetFolderName: string | null;
}

export default function EntityDragOverlayContent({
  entities,
  targetFolderName,
}: Props) {
  const isSingle = entities.length === 1;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 shadow-lg text-sm max-w-64">
      <div className="font-medium truncate">
        {isSingle ? entities[0].name : <GroupSummary entities={entities} />}
      </div>
      <div className="text-muted-foreground text-xs mt-1">
        {targetFolderName
          ? `انتقال به «${targetFolderName}»`
          : "روی یک پوشه رها کن"}
      </div>
    </div>
  );
}

function GroupSummary({ entities }: { entities: DraggingEntity[] }) {
  const folderCount = entities.filter((e) => e.type === "folder").length;
  const noteCount = entities.filter((e) => e.type === "note").length;

  const parts: string[] = [];
  if (folderCount > 0) parts.push(`${folderCount} فولدر`);
  if (noteCount > 0) parts.push(`${noteCount} فایل`);

  return <span>{parts.join(" و ")}</span>;
}
