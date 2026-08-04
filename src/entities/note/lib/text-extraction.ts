/**
 * entities/note/lib/text-extraction.ts
 *
 * Tiptap stores content as a ProseMirror JSON document, e.g.:
 * { type: "doc", content: [ { type: "paragraph", content: [ { type: "text", text: "سلام" } ] } ] }
 *
 * FlexSearch (and our own exact regex scan) need plain text, not JSON.
 * But later, when the user clicks a result, we need to jump BACK from a
 * plain-text character offset to a real ProseMirror position inside the
 * live editor. That only works if both directions use the EXACT SAME
 * separator rules when turning the doc into text.
 *
 * `BLOCK_SEPARATOR` is the single source of truth for that rule: every
 * block-level node (paragraph, heading, list item, etc.) is joined with
 * this separator when concatenating text. Both functions below insert
 * this separator using the SAME recursive structure (walk children, then
 * add one separator per non-text node that has content), so offsets
 * computed by one match offsets computed by the other.
 */

const BLOCK_SEPARATOR = "\n";
const BLOCK_SEPARATOR_LENGTH = BLOCK_SEPARATOR.length;

/** Minimal shape of a Tiptap/ProseMirror JSON node - enough for text walking. */
interface TiptapJSONNode {
  type?: string;
  text?: string;
  content?: TiptapJSONNode[];
}

/**
 * Worker-side extraction: walks the RAW JSON (no ProseMirror instance
 * needed, so this works fine inside a Web Worker with no editor mounted).
 *
 * Accepts either an already-parsed object or a JSON string, since the
 * `content` field might be stored either way.
 */
export function extractPlainTextFromTiptapJSON(rawContent: unknown): string {
  const node = normalizeToJSONNode(rawContent);
  if (!node) return "";

  const parts: string[] = [];
  walkJSONNode(node, parts);
  return parts.join("");
}

function normalizeToJSONNode(rawContent: unknown): TiptapJSONNode | null {
  if (!rawContent) return null;
  if (typeof rawContent === "string") {
    try {
      return JSON.parse(rawContent) as TiptapJSONNode;
    } catch {
      return null;
    }
  }
  return rawContent as TiptapJSONNode;
}

function walkJSONNode(node: TiptapJSONNode, parts: string[]): void {
  if (node.type === "text" && node.text) {
    parts.push(node.text);
  }

  if (node.content) {
    for (const child of node.content) {
      walkJSONNode(child, parts);
    }
  }

  // A block-level node (anything with its own `content` array that ISN'T
  // an inline text run) gets a separator after it, so "پاراگراف اول" and
  // "پاراگراف دوم" don't glue together into "پاراگراف اولپاراگراف دوم".
  if (node.content && node.type !== "text") {
    parts.push(BLOCK_SEPARATOR);
  }
}

/**
 * Editor-side lookup: given the REAL, live ProseMirror doc node (from
 * `editor.state.doc`) and a plain-text character offset (as produced by
 * `extractPlainTextFromTiptapJSON` above), returns the matching real
 * ProseMirror document position.
 *
 * THE BUG THIS FIXES: an earlier version of this function only counted
 * TEXT length while walking `doc.descendants`, and never accounted for
 * the `BLOCK_SEPARATOR` character that `extractPlainTextFromTiptapJSON`
 * inserts after every paragraph/block. That mismatch accumulates by
 * exactly one character per block boundary crossed - which is exactly
 * why each subsequent line's highlight landed one character further off
 * than the line before it.
 *
 * The fix: walk the live doc with the SAME recursive shape as
 * `walkJSONNode` above (process a node's children, THEN account for one
 * separator once that node's content is done), instead of the flat
 * `doc.descendants` traversal, which has no way to signal "this block's
 * children are finished."
 */
export function findProseMirrorPositionForOffset(
  doc: ProseMirrorLikeNode,
  targetOffset: number
): number | null {
  const state: WalkState = { emitted: 0, target: targetOffset, found: null };
  walkLiveNode(doc, 0, state);
  return state.found;
}

/** Minimal shape of a real `editor.state.doc` (or any of its descendants) we rely on. */
interface ProseMirrorLikeNode {
  isText?: boolean;
  text?: string | null;
  content: { childCount: number };
  forEach: (callback: (child: ProseMirrorLikeNode, offset: number) => void) => void;
}

interface WalkState {
  /** How many plain-text characters (matching extractPlainTextFromTiptapJSON's output) we've accounted for so far. */
  emitted: number;
  target: number;
  found: number | null;
}

/**
 * `contentStartPos` is the absolute ProseMirror position right where THIS
 * node's own content begins (for `doc` itself, that's always 0; for any
 * other container node whose own start position is `nodeStart`, its
 * content begins at `nodeStart + 1`).
 */
function walkLiveNode(node: ProseMirrorLikeNode, contentStartPos: number, state: WalkState): void {
  node.forEach((child, offsetWithinParent) => {
    if (state.found !== null) return; // Already found it - ignore remaining siblings.

    const childPos = contentStartPos + offsetWithinParent;

    if (child.isText) {
      const text = child.text ?? "";
      const textLength = text.length;

      if (state.target >= state.emitted && state.target <= state.emitted + textLength) {
        state.found = childPos + (state.target - state.emitted);
        return;
      }

      state.emitted += textLength;
      return;
    }

    if (child.content && child.content.childCount > 0) {
      // Recurse into this child's own content (which starts right after
      // its opening token, i.e. one position further in).
      walkLiveNode(child, childPos + 1, state);
      if (state.found !== null) return;

      // Mirrors `walkJSONNode`'s `parts.push(BLOCK_SEPARATOR)` - exactly
      // one separator, counted right after this block's content is done.
      state.emitted += BLOCK_SEPARATOR_LENGTH;
    }

    // Leaf/atomic non-text nodes (e.g. a hard line break) have no content,
    // so - matching walkJSONNode - they contribute nothing here either.
  });
}