import { db } from "@/app/indexed-db/db";
import { createWorkerRpcServer } from "@/shared/lib/create-worker-rpc";
import { extractPlainTextFromTiptapJSON } from "@/entities/note/lib/text-extraction";
import { buildPreview } from "../lib/build-preview";
import type {
  NoteContentEntry,
  NotePartialChange,
  InitContentResponse,
  NoteSearchResult,
  SearchMatch,
  NoteChangedPayload,
  NoteDeletedPayload,
  ScanMatchesPayload,
  ScanMatchesResponse,
} from "../model/types";
import type { NoteEntity } from "@/entities/note/model/types";

// ---------------------------------------------------------------------------
// In-memory state, living only inside this worker's lifetime.
// ---------------------------------------------------------------------------

const plainTextByNoteId = new Map<string, string>();
const titleByNoteId = new Map<string, string>();
const updatedAtByNoteId = new Map<string, number | undefined>();

// ---------------------------------------------------------------------------
// Building / maintaining the content cache
// ---------------------------------------------------------------------------

async function collectAllNoteContent(): Promise<InitContentResponse> {
  const notes: NoteEntity[] = await db.notes.toArray();
  return notes.map((note) =>
    applyPartialNoteChange({
      id: note.id,
      title: note.name,
      content: note.content,
      updatedAt: Number(note.updated_at),
    })
  );
}


function applyPartialNoteChange(change: NotePartialChange): NoteContentEntry {
  const title = change.title ?? titleByNoteId.get(change.id) ?? "";

  const plainText =
    change.content !== undefined
      ? extractPlainTextFromTiptapJSON(change.content)
      : plainTextByNoteId.get(change.id) ?? "";

  const updatedAt = change.updatedAt ?? updatedAtByNoteId.get(change.id);

  plainTextByNoteId.set(change.id, plainText);
  titleByNoteId.set(change.id, title);
  updatedAtByNoteId.set(change.id, updatedAt);

  return { id: change.id, title, plainText, updatedAt };
}

function removeNoteFromCache(noteId: string): void {
  plainTextByNoteId.delete(noteId);
  titleByNoteId.delete(noteId);
  updatedAtByNoteId.delete(noteId);
}


function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMatchesInText(
  text: string,
  regex: RegExp,
  noteId: string,
  source: "title" | "content"
): SearchMatch[] {
  const matches: SearchMatch[] = [];
  regex.lastIndex = 0;
  let execResult: RegExpExecArray | null;

  while ((execResult = regex.exec(text)) !== null) {
    const start = execResult.index;
    const end = start + execResult[0].length;
    const { preview, previewMatchStart, previewMatchEnd } = buildPreview(text, start, end);

    matches.push({
      matchId: `${noteId}-${source}-${start}`,
      start,
      end,
      preview,
      previewMatchStart,
      previewMatchEnd,
      source,
    });

    if (execResult[0].length === 0) regex.lastIndex++;
  }

  return matches;
}

function scanMatches(payload: ScanMatchesPayload): ScanMatchesResponse {
  const { noteIds, query, matchCase } = payload;
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { results: [], totalMatches: 0 };
  }

  const regex = new RegExp(escapeRegExp(trimmedQuery), matchCase ? "g" : "gi");
  const results: NoteSearchResult[] = [];
  let totalMatches = 0;

  for (const noteId of noteIds) {
    const title = titleByNoteId.get(noteId) ?? "";
    const fullText = plainTextByNoteId.get(noteId) ?? "";

    // Scan BOTH the title and the content - a note whose only occurrence is
    // in its title (and none in the body) is still a real match and must
    // not be silently dropped just because the content-only scan came back
    // empty.
    const titleMatches = findMatchesInText(title, regex, noteId, "title");
    const contentMatches = findMatchesInText(fullText, regex, noteId, "content");
    const matches = [...titleMatches, ...contentMatches];

    if (matches.length > 0) {
      results.push({
        noteId,
        title,
        updatedAt: updatedAtByNoteId.get(noteId),
        matches,
      });
      totalMatches += matches.length;
    }
  }

  // Preserve the candidate order we were given (that order already reflects
  // FlexSearch's own relevance ranking) rather than re-sorting here.
  return { results, totalMatches };
}


createWorkerRpcServer({
  init: async (): Promise<InitContentResponse> => collectAllNoteContent(),

  noteChanged: async (payload: NoteChangedPayload): Promise<NoteContentEntry> =>
    applyPartialNoteChange(payload.change),

  noteDeleted: async (payload: NoteDeletedPayload): Promise<{ ok: true }> => {
    removeNoteFromCache(payload.noteId);
    return { ok: true };
  },

  scanMatches: async (payload: ScanMatchesPayload): Promise<ScanMatchesResponse> =>
    scanMatches(payload),
});