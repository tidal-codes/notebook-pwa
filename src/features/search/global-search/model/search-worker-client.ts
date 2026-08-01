import { createWorkerRpcClient } from "@/shared/lib/create-worker-rpc";
import type {
  NoteChangedPayload,
  NoteDeletedPayload,
  SearchResponsePayload,
} from "./types";
import type { NoteEntity } from "@/entities/note/model/types";

export interface SearchWorkerClient {
  init: () => Promise<{ ready: boolean }>;
  search: (query: string, matchCase: boolean) => Promise<SearchResponsePayload>;
  notifyNoteChanged: (note: NoteEntity) => Promise<void>;
  notifyNoteDeleted: (noteId: string) => Promise<void>;
  terminate: () => void;
}

export function createSearchWorkerClient(): SearchWorkerClient {

  const worker = new Worker(
    new URL("../workers/search.worker.ts", import.meta.url),
    {
      type: "module",
    },
  );

  const rpc = createWorkerRpcClient(worker);

  return {
    init: () => rpc.call("init"),

    search: (query, matchCase) =>
      rpc.call<SearchRequestPayload, SearchResponsePayload>("search", {
        query,
        matchCase,
      }),

    notifyNoteChanged: (note) =>
      rpc.call<NoteChangedPayload, void>("noteChanged", { note }),

    notifyNoteDeleted: (noteId) =>
      rpc.call<NoteDeletedPayload, void>("noteDeleted", { noteId }),

    terminate: () => rpc.terminate(),
  };
}
