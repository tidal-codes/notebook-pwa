function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getNextIndexedName(
  existingNames: string[],
  prefix: string = "untitled",
): string {
  const usedNumbers = new Set<number>();
  let hasBareName = false;

  const pattern = new RegExp(`^${escapeRegExp(prefix)} (\\d+)$`);

  for (const name of existingNames) {
    if (name === prefix) {
      hasBareName = true;
      continue;
    }

    const match = name.match(pattern);
    if (match) {
      usedNumbers.add(Number(match[1]));
    }
  }

  if (!hasBareName) return prefix;

  let n = 1;
  while (usedNumbers.has(n)) n++;

  return `${prefix} ${n}`;
}

export function getNextUntitledName(existingNames: string[]): string {
  return getNextIndexedName(existingNames, "untitled");
}

export function isTitleUnique(existingNames: string[], title: string): boolean {
  return !existingNames.includes(title);
}