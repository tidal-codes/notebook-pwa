import { Document } from "flexsearch";

export interface FlexNoteDoc {
  id: string;
  title: string;
  content: string;
}

export async function createFlexIndex() {

  const index = new Document({
    document: {
      id: "id",
      index: [
        { field: "title", tokenize: "full" },
        { field: "content", tokenize: "full" },
      ],
    },
    tokenize: "full",
    context: true,
  });

  return index;
}

/** Convenience alias - what `createFlexIndex()` resolves to. */
export type FlexIndex = Awaited<ReturnType<typeof createFlexIndex>>;
