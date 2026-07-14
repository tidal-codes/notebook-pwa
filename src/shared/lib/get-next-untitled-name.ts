// lib/get-next-untitled-name.ts

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getNextUntitledName(
  existingNames: string[],
  baseName: string = "untitled",
): string {
  const usedNumbers = new Set<number>();
  let hasBareName = false;

  const pattern = new RegExp(`^${escapeRegExp(baseName)} (\\d+)$`);

  for (const name of existingNames) {
    if (name === baseName) {
      hasBareName = true;
      continue;
    }

    const match = name.match(pattern);
    if (match) {
      usedNumbers.add(Number(match[1]));
    }
  }

  if (!hasBareName) return baseName;

  let n = 1;
  while (usedNumbers.has(n)) n++;

  return `${baseName} ${n}`;
}

/**
 * Ensures the given title doesn't conflict with any existing name.
 * Returns true if the title is unique, false if it already exists.
 */
export function isTitleUnique(existingNames: string[], title: string): boolean {
  return !existingNames.includes(title);
}
