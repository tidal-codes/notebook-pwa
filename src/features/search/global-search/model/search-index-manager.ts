import { createNotesContentWorkerClient } from "./notes-content-worker-client";
import { createFlexIndex, type FlexIndex } from "./create-flex-index";
import { dedupeCandidateIds } from "../lib/dedupe-candidate-ids";
import type { NotePartialChange, SearchResponsePayload } from "./types";

export interface SearchIndexManager {
  /** Idempotent - safe to call multiple times; only does real work once. */
  init: () => Promise<void>;
  search: (
    query: string,
    matchCase: boolean,
    limit?: number,
  ) => Promise<SearchResponsePayload>;
  notifyNoteChanged: (change: NotePartialChange) => Promise<void>;
  notifyNoteDeleted: (noteId: string) => Promise<void>;
  terminate: () => void;
}

export function createSearchIndexManager(): SearchIndexManager {
  const contentClient = createNotesContentWorkerClient();

  let flexIndex: FlexIndex | null = null;
  let readyPromise: Promise<void> | null = null;

  async function ensureReady(): Promise<void> {
    if (readyPromise) return readyPromise;

    readyPromise = (async () => {
      const [allNoteContent, index] = await Promise.all([
        contentClient.init(),
        createFlexIndex(),
      ]);

      flexIndex = index;

      await Promise.all(
        allNoteContent.map((entry) =>
          index.add({
            id: entry.id,
            title: entry.title,
            content: entry.plainText,
          }),
        ),
      );
    })();

    return readyPromise;
  }

  async function search(
    query: string,
    matchCase: boolean,
    limit: number = 50,
  ): Promise<SearchResponsePayload> {
    await ensureReady();

    const trimmedQuery = query.trim();
    if (!trimmedQuery || !flexIndex) {
      return { query, results: [], totalMatches: 0 };
    }

    // Step 1: fast fuzzy candidate lookup - runs inside FlexSearch's OWN
    // worker, off the main thread, without us managing that worker at all.
    const fieldResults = await flexIndex.search(trimmedQuery, {
      limit,
      enrich: false,
    });
    const candidateNoteIds = dedupeCandidateIds(fieldResults as any);

    if (candidateNoteIds.length === 0) {
      return { query, results: [], totalMatches: 0 };
    }

    // Step 2: exact, matchCase-aware scan + preview building - runs inside
    // OUR OWN worker, only on the small candidate subset.
    const { results, totalMatches } = await contentClient.scanMatches(
      candidateNoteIds,
      trimmedQuery,
      matchCase,
    );

    return { query, results, totalMatches };
  }

  async function notifyNoteChanged(change: NotePartialChange): Promise<void> {
    await ensureReady();
    const entry = await contentClient.notifyNoteChanged(change);
    await flexIndex?.update({
      id: entry.id,
      title: entry.title,
      content: entry.plainText,
    });
  }

  async function notifyNoteDeleted(noteId: string): Promise<void> {
    await ensureReady();
    await contentClient.notifyNoteDeleted(noteId);
    await flexIndex?.remove(noteId);
  }

  function terminate() {
    contentClient.terminate();
  }

  return {
    init: ensureReady,
    search,
    notifyNoteChanged,
    notifyNoteDeleted,
    terminate,
  };
}


let singleton: SearchIndexManager | null = null;

export function getSearchIndexManager(): SearchIndexManager {
  if (!singleton) {
    singleton = createSearchIndexManager();
  }
  return singleton;
}
