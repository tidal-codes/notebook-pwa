import type { NoteEntity } from "@/entities/note/model/types";


/** One exact occurrence of the search term inside a single note. */
export interface SearchMatch {
  /** Stable id for React keys: `${noteId}-${start}`. */
  matchId: string;
  /** Character offset of the match start, inside the note's plain text. */
  start: number;
  /** Character offset of the match end (exclusive), inside the plain text. */
  end: number;
  /** ~50 chars of context before + the match + ~50 chars after. */
  preview: string;
  /** Where the match starts inside `preview` (for bolding/highlighting it). */
  previewMatchStart: number;
  /** Where the match ends inside `preview`. */
  previewMatchEnd: number;
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

/** Sent to the content worker after a note is created or edited. */
export interface NoteChangedPayload {
  note: NoteEntity;
}

/** Sent to the content worker after a note is deleted. */
export interface NoteDeletedPayload {
  noteId: string;
}

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
