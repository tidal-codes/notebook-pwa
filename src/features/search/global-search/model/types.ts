
/** One exact occurrence of the search term inside a single note. */
export interface SearchMatch {
  /** Stable id for React keys: `${noteId}-${source}-${start}`. */
  matchId: string;
  /** Character offset of the match start, inside the source text (title or plain content). */
  start: number;
  /** Character offset of the match end (exclusive), inside the source text. */
  end: number;
  /** ~50 chars of context before + the match + ~50 chars after. */
  preview: string;
  /** Where the match starts inside `preview` (for bolding/highlighting it). */
  previewMatchStart: number;
  /** Where the match ends inside `preview`. */
  previewMatchEnd: number;
  /** Whether this occurrence was found in the note's title or its content. */
  source: "title" | "content";
}

/** All matches found inside one note, grouped together. */
export interface NoteSearchResult {
  noteId: string;
  title: string;
  updatedAt?: number;
  matches: SearchMatch[];
}

/** Final shape `useGlobalSearch` / the UI consumes for one search. */
export interface SearchResponsePayload {
  query: string;
  results: NoteSearchResult[];
  totalMatches: number;
}

// ---------------------------------------------------------------------------
// Types for talking to OUR OWN "notes-content" worker (Dexie + text extraction
// + exact regex scan only — this worker never imports flexsearch).
// ---------------------------------------------------------------------------

/** One note's extracted plain text, as produced by the content worker. */
export interface NoteContentEntry {
  id: string;
  title: string;
  plainText: string;
  updatedAt?: number;
}

/** Response of the content worker's `init` call: every note, pre-extracted. */
export type InitContentResponse = NoteContentEntry[];

/**
 * What a mutation hook actually has on hand at the moment it fires - NOT
 * a full `NoteRecord`. Only `id` is required; supply whichever of
 * `title`/`content`/`updatedAt` actually changed. Whatever you omit, the
 * content worker keeps using its own cached value for that field (e.g. a
 * rename only needs to send `{ id, title }` - the cached content is left
 * untouched).
 */
export interface NotePartialChange {
  id: string;
  title?: string;
  /** Tiptap/ProseMirror JSON (object or JSON string) - only if content changed. */
  content?: unknown;
  updatedAt?: number;
}

/** Sent to the content worker after a note is created, renamed, or its content edited. */
export interface NoteChangedPayload {
  change: NotePartialChange;
}

/** Sent to the content worker after a note is deleted. */
export interface NoteDeletedPayload {
  noteId: string;
}

/**
 * Sent to the content worker AFTER FlexSearch (on the main thread) has
 * already narrowed the field down to `noteIds` — the content worker then
 * does the exact, matchCase-aware regex scan ONLY on those notes and builds
 * the previews.
 */
export interface ScanMatchesPayload {
  noteIds: string[];
  query: string;
  matchCase: boolean;
}

export interface ScanMatchesResponse {
  results: NoteSearchResult[];
  totalMatches: number;
}

/** The full set of message "types" the content worker understands. */
export type ContentWorkerRequestType =
  | "init"
  | "noteChanged"
  | "noteDeleted"
  | "scanMatches";