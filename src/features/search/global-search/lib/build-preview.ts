
const DEFAULT_CONTEXT_LENGTH = 50;

export interface PreviewResult {
  preview: string;
  previewMatchStart: number;
  previewMatchEnd: number;
}

export function buildPreview(
  fullText: string,
  matchStart: number,
  matchEnd: number,
  contextLength: number = DEFAULT_CONTEXT_LENGTH,
): PreviewResult {
  const rawStart = Math.max(0, matchStart - contextLength);
  const rawEnd = Math.min(fullText.length, matchEnd + contextLength);

  const hasMoreBefore = rawStart > 0;
  const hasMoreAfter = rawEnd < fullText.length;

  const beforeEllipsis = hasMoreBefore ? "…" : "";
  const afterEllipsis = hasMoreAfter ? "…" : "";


  const rawSlice = fullText.slice(rawStart, rawEnd);
  const { collapsed, offsetMap } = collapseWhitespace(rawSlice);

  const localMatchStart = offsetMap(matchStart - rawStart);
  const localMatchEnd = offsetMap(matchEnd - rawStart);

  const preview = `${beforeEllipsis}${collapsed}${afterEllipsis}`;
  const prefixLength = beforeEllipsis.length;

  return {
    preview,
    previewMatchStart: prefixLength + localMatchStart,
    previewMatchEnd: prefixLength + localMatchEnd,
  };
}

/**
 * Turns runs of whitespace/newlines into a single space, while giving back
 * a function to translate an ORIGINAL offset (within the un-collapsed
 * slice) into the equivalent offset in the collapsed string. This keeps
 * the highlighted range accurate even after cleanup.
 */
function collapseWhitespace(text: string): {
  collapsed: string;
  offsetMap: (originalOffset: number) => number;
} {
  let collapsed = "";
  const map: number[] = [];
  let previousWasSpace = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isWhitespace = /\s/.test(char);

    if (isWhitespace) {
      if (!previousWasSpace) {
        collapsed += " ";
        map.push(collapsed.length - 1);
      } else {
        map.push(collapsed.length - 1);
      }
      previousWasSpace = true;
    } else {
      collapsed += char;
      map.push(collapsed.length - 1);
      previousWasSpace = false;
    }
  }

  // Offset that lands exactly at text.length (an "end" offset) should map
  // to collapsed.length, not the last character's index.
  map.push(collapsed.length);

  return {
    collapsed,
    offsetMap: (originalOffset: number) => {
      const clamped = Math.max(0, Math.min(originalOffset, map.length - 1));
      return map[clamped];
    },
  };
}
