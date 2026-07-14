import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExplorerType, SelectedEntityMeta } from "./types";
import type { TreeEntity } from "@/shared/model/types";

const initialState: ExplorerType = {
  lastAddedItemId: null,
  semiSelecteditem: null,
  isSelectMode: false,
  selectedEntities: {},
  renamingId: null,
};

interface ShiftClickPayload {
  id: string;
  type: TreeEntity;
  // چون برای محاسبه‌ی رنج به type همه‌ی آیتم‌های وسط رنج هم نیاز داریم
  orderedItems: SelectedEntityMeta[];
}

// --- Helper های داخلی (export نمیشن، صرفاً برای حذف تکرار) ---

function toggleSelected(state: ExplorerType, entity: SelectedEntityMeta) {
  if (state.selectedEntities[entity.id]) {
    delete state.selectedEntities[entity.id];

    if (Object.keys(state.selectedEntities).length === 0) {
      state.isSelectMode = false;
    }
    return;
  }

  state.selectedEntities[entity.id] = entity;
}

function addSelected(state: ExplorerType, entity: SelectedEntityMeta) {
  state.selectedEntities[entity.id] = entity;
}

function clearRenamingState(state: ExplorerType) {
  if (state.lastAddedItemId === state.renamingId) {
    state.lastAddedItemId = null;
  }
  state.renamingId = null;
}

const explorer = createSlice({
  name: "explorer",
  initialState,
  reducers: {
    // ---------- Click / Selection ----------

    itemClicked: (
      state,
      action: PayloadAction<{ id: string; type: TreeEntity }>,
    ) => {
      const { id, type } = action.payload;

      if (state.lastAddedItemId !== null) {
        state.lastAddedItemId = null;
      }

      if (!state.isSelectMode) {
        state.semiSelecteditem = { id, type };
        return;
      }

      toggleSelected(state, { id, type });
    },

    shiftItemClicked: (state, action: PayloadAction<ShiftClickPayload>) => {
      const { id, type, orderedItems } = action.payload;

      const orderedIds = orderedItems.map((item) => item.id);
      const clickedIndex = orderedIds.indexOf(id);
      if (clickedIndex === -1) return;

      let anchorId: string | undefined;

      if (!state.isSelectMode) {
        anchorId = state.semiSelecteditem?.id;

        if (!anchorId) {
          addSelected(state, { id, type });
          state.isSelectMode = true;
          return;
        }
      } else {
        const selectedIndices = Object.keys(state.selectedEntities)
          .map((selectedId) => orderedIds.indexOf(selectedId))
          .filter((index) => index !== -1);

        if (selectedIndices.length === 0) {
          addSelected(state, { id, type });
          return;
        }

        const minSelectedIndex = Math.min(...selectedIndices);
        const maxSelectedIndex = Math.max(...selectedIndices);

        if (clickedIndex > maxSelectedIndex) {
          anchorId = orderedIds[minSelectedIndex];
        } else if (clickedIndex < minSelectedIndex) {
          anchorId = orderedIds[maxSelectedIndex];
        } else {
          anchorId = orderedIds[minSelectedIndex];
        }
      }

      const anchorIndex = orderedIds.indexOf(anchorId!);
      if (anchorIndex === -1) return;

      const [start, end] =
        anchorIndex < clickedIndex
          ? [anchorIndex, clickedIndex]
          : [clickedIndex, anchorIndex];

      const range = orderedItems.slice(start, end + 1);

      for (const item of range) {
        addSelected(state, item);
      }
      state.isSelectMode = true;
    },

    toggleItemChecked: (
      state,
      action: PayloadAction<{ id: string; type: TreeEntity }>,
    ) => {
      toggleSelected(state, action.payload);
    },

    // ورود به حالت سلکت از طریق منوی آیتم (دکمه ...)
    enterSelectModeFromMenu: (
      state,
      action: PayloadAction<{ id: string; type: TreeEntity } | undefined>,
    ) => {
      state.isSelectMode = true;

      if (action.payload) {
        addSelected(state, action.payload);
      }
    },

    selectAll: (state, action: PayloadAction<SelectedEntityMeta[]>) => {
      state.selectedEntities = Object.fromEntries(
        action.payload.map((entity) => [entity.id, entity]),
      );
      state.isSelectMode = true;
    },

    toggleFolderSelectionWithChildren: (
      state,
      action: PayloadAction<{
        folder: SelectedEntityMeta;
        descendants: SelectedEntityMeta[];
      }>,
    ) => {
      const { folder, descendants } = action.payload;

      const isCurrentlySelected = Boolean(state.selectedEntities[folder.id]);
      const allEntities = [folder, ...descendants];

      if (isCurrentlySelected) {
        for (const entity of allEntities) {
          delete state.selectedEntities[entity.id];
        }

        if (Object.keys(state.selectedEntities).length === 0) {
          state.isSelectMode = false;
        }
        return;
      }

      for (const entity of allEntities) {
        addSelected(state, entity);
      }
      state.isSelectMode = true;
    },

    // خروج کامل از حالت سلکت (مثلا دکمه بستن بالک‌بار)
    clearSelection: (state) => {
      state.selectedEntities = {};
      state.isSelectMode = false;
      state.semiSelecteditem = null;
    },

    // ---------- Rename ----------

    startRenaming: (state, action: PayloadAction<string>) => {
      state.renamingId = action.payload;
    },

    finishRenaming: (state) => {
      clearRenamingState(state);
    },

    cancelRenaming: (state) => {
      clearRenamingState(state);
    },

    // ---------- Last added item ----------

    itemAdded: (state, action: PayloadAction<string>) => {
      state.lastAddedItemId = action.payload;
    },

    lastAddedItemCleared: (state) => {
      state.lastAddedItemId = null;
    },
    // -------------------------------------
    semiSelectedItemChanged: (
      state,
      action: PayloadAction<{ id: string; type: TreeEntity } | null>,
    ) => {
      state.semiSelecteditem = action.payload;
    },

    semiSelectedItemCleared: (state) => {
      state.semiSelecteditem = null;
    },
  },
});

export const {
  itemClicked,
  shiftItemClicked,
  toggleItemChecked,
  enterSelectModeFromMenu,
  selectAll,
  toggleFolderSelectionWithChildren,
  clearSelection,
  startRenaming,
  cancelRenaming,
  finishRenaming,
  itemAdded,
  semiSelectedItemChanged,
  semiSelectedItemCleared,
  lastAddedItemCleared,
} = explorer.actions;

export default explorer.reducer;
