import type { RootState } from "@/shared/config/store/store";
import { createSelector } from "@reduxjs/toolkit";
import type { ExplorerType } from "./types";


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

export const selectSelectedIds = createSelector(
  selectExplorer,
  (state) => state.selectedIds,
);

// derived
export const selectSelectedCount = createSelector(
  selectSelectedIds,
  (selectedIds) => selectedIds.length,
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

export const selectIsSelected = createSelector(
  [selectSelectedIds, (_: RootState, id: string) => id],
  (selectedIds, id) => selectedIds.includes(id),
);

export const selectSelectedMap = createSelector(
  selectSelectedIds,
  (selectedIds) => new Set(selectedIds),
);

export const selectIsSelectedFast = createSelector(
  [selectSelectedMap, (_: RootState, id: string) => id],
  (selectedSet, id) => selectedSet.has(id),
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