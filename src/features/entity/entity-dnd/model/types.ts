import type { TreeEntity } from "@/shared/model/types";


export interface DraggingEntity {
  id: string;
  type: TreeEntity;
  // فقط برای حالت تکی پر می‌شه؛ چون overlay گروهی فقط تعداد می‌خواد نه اسم تک‌تک
  name?: string;
}

export type OnEntitiesDropped = (
  entities: DraggingEntity[],
  targetFolderId: string,
) => void;