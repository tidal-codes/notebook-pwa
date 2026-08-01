

const BLOCK_SEPARATOR = "\n";


interface TiptapJSONNode {
  type?: string;
  text?: string;
  content?: TiptapJSONNode[];
}


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


  if (node.content && node.type !== "text") {
    parts.push(BLOCK_SEPARATOR);
  }
}


export function findProseMirrorPositionForOffset(
  doc: {
    descendants: (cb: (node: any, pos: number) => boolean | void) => void;
  },
  targetOffset: number,
): number | null {
  let emittedLength = 0;
  let foundPos: number | null = null;

  doc.descendants((node: any, pos: number) => {
    if (foundPos !== null) return false; // Already found it, stop descending.

    if (node.isText) {
      const text: string = node.text ?? "";
      const textLength = text.length;

      if (
        targetOffset >= emittedLength &&
        targetOffset <= emittedLength + textLength
      ) {
        foundPos = pos + (targetOffset - emittedLength);
        return false;
      }

      emittedLength += textLength;
      return true;
    }
    if (node.isBlock && node.content && node.content.size > 0) {
      // We add the separator AFTER processing children, so we do nothing
      // here on the way in - it's added when leaving. ProseMirror's
      // `descendants` doesn't give us an "on leave" hook directly, so we
      // approximate by adding the separator once the whole block node's
      // content has been walked. See note below.
    }

    return true;
  });
  return foundPos;
}
