import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExplorerType } from "./types";

const initialState: ExplorerType = {
  lastAddedItemId: null,
  semiSelecteditem: null,
  isSelectMode: false,
  selectedIds: [],
  renamingId: null,
};

interface ShiftClickPayload {
  id: string;
  orderedIds: string[];
}

// --- Helper های داخلی (export نمیشن، صرفاً برای حذف تکرار) ---

function toggleSelected(state: ExplorerType, id: string) {
  const index = state.selectedIds.indexOf(id);

  if (index >= 0) {
    state.selectedIds.splice(index, 1);

    if (state.selectedIds.length === 0) {
      state.isSelectMode = false;
    }
    return;
  }

  state.selectedIds.push(id);
}

function clearRenamingState(state: ExplorerType) {
  // فقط اگر rename مربوط به همون آیتم تازه‌ساخته بود، لست‌ادد رو هم پاک کن
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
      action: PayloadAction<{ id: string; type: "note" | "folder" }>,
    ) => {
      const { id, type } = action.payload;

      // کلیک دستی روی هر آیتمی یعنی دیگه نیازی به هایلایت "تازه‌ساخته‌شده" نیست
      if (state.lastAddedItemId !== null) {
        state.lastAddedItemId = null;
      }

      // حالت عادی: فقط focus/semi-select عوض میشه
      if (!state.isSelectMode) {
        state.semiSelecteditem = { id, type };
        return;
      }

      // حالت انتخاب: toggle می‌کنیم
      toggleSelected(state, id);
    },

    shiftItemClicked: (state, action: PayloadAction<ShiftClickPayload>) => {
      const { id, orderedIds } = action.payload;

      const clickedIndex = orderedIds.indexOf(id);
      if (clickedIndex === -1) return;

      let anchorId: string | undefined;

      if (!state.isSelectMode) {
        // اولین شیفت‌کلیک، هنوز وارد سلکت مود نشدیم: انکور همون سمی‌سلکتده
        anchorId = state.semiSelecteditem?.id;

        if (!anchorId) {
          // نه سلکت مودیم نه سمی‌سلکتد داریم: فقط همین آیتم رو سلکت کن و وارد سلکت مود شو
          if (!state.selectedIds.includes(id)) {
            state.selectedIds.push(id);
          }
          state.isSelectMode = true;
          return;
        }
      } else {
        // توی سلکت مود هستیم: انکور دیگه سمی‌سلکتد نیست،
        // بلکه بر اساس موقعیت کلیک نسبت به رنج فعلیِ سلکت‌شده تعیین می‌شه
        const selectedIndices = state.selectedIds
          .map((selectedId) => orderedIds.indexOf(selectedId))
          .filter((index) => index !== -1);

        if (selectedIndices.length === 0) {
          // هیچ آیتم معتبری توی selectedIds نیست (حالت غیرمنتظره) → فقط همین آیتم رو سلکت کن
          if (!state.selectedIds.includes(id)) {
            state.selectedIds.push(id);
          }
          return;
        }

        const minSelectedIndex = Math.min(...selectedIndices);
        const maxSelectedIndex = Math.max(...selectedIndices);

        if (clickedIndex > maxSelectedIndex) {
          // پایین‌تر از همه‌ی سلکت‌شده‌ها کلیک شده: انکور اولین آیتم سلکت‌شده‌ست
          anchorId = orderedIds[minSelectedIndex];
        } else if (clickedIndex < minSelectedIndex) {
          // بالاتر از همه‌ی سلکت‌شده‌ها کلیک شده: انکور آخرین آیتم سلکت‌شده‌ست
          anchorId = orderedIds[maxSelectedIndex];
        } else {
          // کلیک داخل رنج فعلیه (بین min و max): فرض می‌کنیم انکور همون اولین آیتم سلکت‌شده‌ست
          anchorId = orderedIds[minSelectedIndex];
        }
      }

      const anchorIndex = orderedIds.indexOf(anchorId!);
      if (anchorIndex === -1) return;

      const [start, end] =
        anchorIndex < clickedIndex
          ? [anchorIndex, clickedIndex]
          : [clickedIndex, anchorIndex];

      const range = orderedIds.slice(start, end + 1);

      state.selectedIds = Array.from(new Set([...state.selectedIds, ...range]));
      state.isSelectMode = true;
    },

    toggleItemChecked: (state, action: PayloadAction<string>) => {
      toggleSelected(state, action.payload);
    },

    // ورود به حالت سلکت از طریق منوی آیتم (دکمه ...)
    enterSelectModeFromMenu: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      const id = action.payload;
      state.isSelectMode = true;

      if (id && !state.selectedIds.includes(id)) {
        state.selectedIds.push(id);
      }
    },

    selectAll: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
      state.isSelectMode = true;
    },

    toggleFolderSelectionWithChildren: (
      state,
      action: PayloadAction<{ folderId: string; descendantIds: string[] }>,
    ) => {
      const { folderId, descendantIds } = action.payload;

      const isCurrentlySelected = state.selectedIds.includes(folderId);
      const allIds = [folderId, ...descendantIds];

      if (isCurrentlySelected) {
        // در حال دی‌سلکت شدنه: فولدر + همه‌ی بچه‌ها حذف بشن
        const idsToRemove = new Set(allIds);
        state.selectedIds = state.selectedIds.filter(
          (id) => !idsToRemove.has(id),
        );

        if (state.selectedIds.length === 0) {
          state.isSelectMode = false;
        }
        return;
      }

      // در حال سلکت شدنه: فولدر + همه‌ی بچه‌ها اضافه بشن (بدون تکراری)
      state.selectedIds = Array.from(
        new Set([...state.selectedIds, ...allIds]),
      );
      state.isSelectMode = true;
    },

    // خروج کامل از حالت سلکت (مثلا دکمه بستن بالک‌بار)
    clearSelection: (state) => {
      state.selectedIds = [];
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
  lastAddedItemCleared,
} = explorer.actions;

export default explorer.reducer;
