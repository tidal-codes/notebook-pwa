import type { RootState } from "@/shared/config/store/store";
import { createSelector } from "@reduxjs/toolkit";
import type { ExplorerType, SelectedEntityMeta } from "./types";

export const selectExplorer = (state: RootState): ExplorerType =>
  state.explorer;

export const selectSemiSelectedItem = createSelector(
  selectExplorer,
  (state) => state.semiSelecteditem,
);

export const selectIsSelectMode = createSelector(
  selectExplorer,
  (state) => state.isSelectMode,
);

// خود Record رو برمی‌گردونه؛ برای lookup سریع با id مستقیم از همین استفاده کن
export const selectSelectedEntities = createSelector(
  selectExplorer,
  (state) => state.selectedEntities,
);

// derived
export const selectSelectedCount = createSelector(
  selectSelectedEntities,
  (selectedEntities) => Object.keys(selectedEntities).length,
);

export const selectHasSelection = createSelector(
  selectSelectedCount,
  (count) => count > 0,
);

export const selectIsSelectionEmpty = createSelector(
  selectSelectedCount,
  (count) => count === 0,
);

export const selectIsSemiSelected = createSelector(
  [selectSemiSelectedItem, (_: RootState, id: string) => id],
  (semiSelectedItem, id) => semiSelectedItem?.id === id,
);

// چون selectedEntities خودش Record هست، دسترسی همین‌جا O(1)ه،
// دیگه نیازی به ساخت Set جداگانه (selectSelectedMap/selectIsSelectedFast) نیست
export const selectIsSelected = createSelector(
  [selectSelectedEntities, (_: RootState, id: string) => id],
  (selectedEntities, id) => Boolean(selectedEntities[id]),
);

// type یه آیتم خاص رو از selection برمی‌گردونه (undefined اگه سلکت نشده)
export const selectSelectedEntityMeta = createSelector(
  [selectSelectedEntities, (_: RootState, id: string) => id],
  (selectedEntities, id): SelectedEntityMeta | undefined =>
    selectedEntities[id],
);

// آرایه‌ی selected entities، برای جاهایی که نیاز به iterate یا پاس دادن
// به هوک‌هایی مثل useDeleteEntities داری
export const selectSelectedEntitiesList = createSelector(
  selectSelectedEntities,
  (selectedEntities): SelectedEntityMeta[] => Object.values(selectedEntities),
);

// فقط idهای فولدرهای انتخاب‌شده
export const selectSelectedFolderIds = createSelector(
  selectSelectedEntitiesList,
  (entities) =>
    entities.filter((entity) => entity.type === "folder").map((e) => e.id),
);

// فقط idهای نوت‌های انتخاب‌شده
export const selectSelectedNoteIds = createSelector(
  selectSelectedEntitiesList,
  (entities) =>
    entities.filter((entity) => entity.type === "note").map((e) => e.id),
);

export const selectCanClearSelection = createSelector(
  [selectHasSelection, selectIsSelectMode],
  (hasSelection, isSelectMode) => hasSelection || isSelectMode,
);

export const selectRenamingId = createSelector(
  selectExplorer,
  (state) => state.renamingId,
);

export const selectIsRenaming = createSelector(
  selectRenamingId,
  (renamingId) => renamingId !== null,
);

export const selectIsRenamingById = createSelector(
  [selectRenamingId, (_: RootState, id: string) => id],
  (renamingId, id) => renamingId === id,
);

export const selectLastAddedItemId = createSelector(
  selectExplorer,
  (state) => state.lastAddedItemId,
);

export const selectHasLastAddedItem = createSelector(
  selectLastAddedItemId,
  (lastAddedItemId) => lastAddedItemId !== null,
);

export const selectIsLastAddedItem = createSelector(
  [selectLastAddedItemId, (_: RootState, id: string) => id],
  (lastAddedItemId, id) => lastAddedItemId === id,
);
