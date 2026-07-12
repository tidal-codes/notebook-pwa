/**
 * Returns the next available "untitled" name.
 * - If no names exist → "untitled"
 * - If "untitled" is free → "untitled"
 * - Fills the lowest missing number gap before going higher
 */
export function getNextUntitledName(existingNames: string[]): string {
  const prefix = "untitled";

  const usedNumbers = new Set<number>();
  let hasBareName = false;

  for (const name of existingNames) {
    if (name === prefix) {
      hasBareName = true;
      continue;
    }

    const match = name.match(/^untitled (\d+)$/);
    if (match) {
      usedNumbers.add(Number(match[1]));
    }
  }

  if (!hasBareName) return prefix;

  let n = 1;
  while (usedNumbers.has(n)) n++;

  return `${prefix} ${n}`;
}

/**
 * Ensures the given title doesn't conflict with any existing name.
 * Returns true if the title is unique, false if it already exists.
 */
export function isTitleUnique(existingNames: string[], title: string): boolean {
  return !existingNames.includes(title);
}
