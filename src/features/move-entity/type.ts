import type { SelectedEntity } from "@/shared/model/types";

export interface MoveEntityDialogItem {
  id: string | null;
  title: string;
}

export interface MoveEntityDialogData {
  entities: SelectedEntity[];
  
}

export type SelectedEntityWithNullableId = Omit<SelectedEntity, "id"> & {
  id: string | null;
};
