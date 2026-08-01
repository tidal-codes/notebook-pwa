import { db } from "@/app/indexed-db/db"; // <-- adjust this path to your real Dexie db module
import { createWorkerRpcServer } from "@/shared/lib/create-worker-rpc";
import { extractPlainTextFromTiptapJSON } from "../lib/text-extraction";
import { buildPreview } from "../lib/build-preview";
import type {
  NoteContentEntry,
  InitContentResponse,
  NoteSearchResult,
  SearchMatch,
  NoteChangedPayload,
  NoteDeletedPayload,
  ScanMatchesPayload,
  ScanMatchesResponse,
} from "../model/types";
import type { NoteEntity } from "@/entities/note/model/types";


const plainTextByNoteId = new Map<string, string>();
const titleByNoteId = new Map<string, string>();
const updatedAtByNoteId = new Map<string, number | undefined>();



async function collectAllNoteContent(): Promise<InitContentResponse> {
  const notes: NoteEntity[] = await db.notes.toArray();
  return notes.map(cacheAndExtractOneNote);
}

function cacheAndExtractOneNote(note: NoteEntity): NoteContentEntry {
  const plainText = extractPlainTextFromTiptapJSON(note.content);

  plainTextByNoteId.set(note.id, plainText);
  titleByNoteId.set(note.id, note.name);
  updatedAtByNoteId.set(note.id, Number(note.updated_at));

  return {
    id: note.id,
    title: note.name,
    plainText,
    updatedAt: Number(note.updated_at),
  };
}

function removeNoteFromCache(noteId: string): void {
  plainTextByNoteId.delete(noteId);
  titleByNoteId.delete(noteId);
  updatedAtByNoteId.delete(noteId);
}


function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    const fullText = plainTextByNoteId.get(noteId);
    if (!fullText) continue;

    const matches: SearchMatch[] = [];
    regex.lastIndex = 0;
    let execResult: RegExpExecArray | null;

    while ((execResult = regex.exec(fullText)) !== null) {
      const start = execResult.index;
      const end = start + execResult[0].length;
      const { preview, previewMatchStart, previewMatchEnd } = buildPreview(
        fullText,
        start,
        end,
      );

      matches.push({
        matchId: `${noteId}-${start}`,
        start,
        end,
        preview,
        previewMatchStart,
        previewMatchEnd,
      });

      if (execResult[0].length === 0) regex.lastIndex++;
    }

    if (matches.length > 0) {
      results.push({
        noteId,
        title: titleByNoteId.get(noteId) ?? "",
        updatedAt: updatedAtByNoteId.get(noteId),
        matches,
      });
      totalMatches += matches.length;
    }
  }


  return { results, totalMatches };
}

createWorkerRpcServer({
  init: async (): Promise<InitContentResponse> => collectAllNoteContent(),

  noteChanged: async (payload: NoteChangedPayload): Promise<NoteContentEntry> =>
    cacheAndExtractOneNote(payload.note),

  noteDeleted: async (payload: NoteDeletedPayload): Promise<{ ok: true }> => {
    removeNoteFromCache(payload.noteId);
    return { ok: true };
  },

  scanMatches: async (
    payload: ScanMatchesPayload,
  ): Promise<ScanMatchesResponse> => scanMatches(payload),
});


console.log("WORKING CORRECTLY")