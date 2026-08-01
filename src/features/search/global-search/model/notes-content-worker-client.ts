

import { createWorkerRpcClient } from "@/shared/lib/create-worker-rpc";
import type {
  InitContentResponse,
  NoteChangedPayload,
  NoteContentEntry,
  NoteDeletedPayload,
  ScanMatchesPayload,
  ScanMatchesResponse,
} from "./types";
import type { NoteEntity } from "@/entities/note/model/types";

export interface NotesContentWorkerClient {
  init: () => Promise<InitContentResponse>;
  notifyNoteChanged: (note: NoteEntity) => Promise<NoteContentEntry>;
  notifyNoteDeleted: (noteId: string) => Promise<void>;
  scanMatches: (
    noteIds: string[],
    query: string,
    matchCase: boolean,
  ) => Promise<ScanMatchesResponse>;
  terminate: () => void;
}

export function createNotesContentWorkerClient(): NotesContentWorkerClient {
  const worker = new Worker(
    new URL("../workers/notes-content.worker.ts", import.meta.url),
    {
      type: "module",
    },
  );

  const rpc = createWorkerRpcClient(worker);

  return {
    init: () => rpc.call<undefined, InitContentResponse>("init"),

    notifyNoteChanged: (note) =>
      rpc.call<NoteChangedPayload, NoteContentEntry>("noteChanged", { note }),

    notifyNoteDeleted: (noteId) =>
      rpc.call<NoteDeletedPayload, void>("noteDeleted", { noteId }),

    scanMatches: (noteIds, query, matchCase) =>
      rpc.call<ScanMatchesPayload, ScanMatchesResponse>("scanMatches", {
        noteIds,
        query,
        matchCase,
      }),

    terminate: () => rpc.terminate(),
  };
}
