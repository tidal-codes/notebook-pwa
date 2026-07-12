export const INDENT_STEP_PX = 16;
const BASE_PADDING_PX = 12;
// نصف عرض آیکون فولدر، تا لاین دقیقا زیر آیکون پوشه‌ی والد قرار بگیره
const ICON_CENTER_OFFSET_PX = 8;

export function getItemPaddingLeft(depth: number): number {
  return BASE_PADDING_PX + depth * INDENT_STEP_PX;
}

export function getGuideLineLeft(depth: number): number {
  return getItemPaddingLeft(depth) + ICON_CENTER_OFFSET_PX;
}