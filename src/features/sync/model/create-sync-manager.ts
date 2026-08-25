import { applyChangeBatch, applyInitialSnapshot, createSyncRepository, createSyncStateRepository } from "@/shared/lib/sync-repository";
import { SyncManager } from "./sync-manager";
import { db } from "@/app/indexed-db/db";
import { toNoteDTO } from "@/entities/note/model/types";
import { toFolderDTO } from "@/entities/folder/model/types";
import { createSupabaseSyncApi } from "../api";
import { supabase } from "@/shared/config/supabase";
import { SYNC_CONFIG } from "./config";


let instance: SyncManager | null = null;

/**
 * Lazily creates (once) and returns the single app-wide SyncManager instance.
 * Import this - do NOT `new SyncManager()` anywhere else.
 */
export function getSyncManager(onSuccessSync: () => void): SyncManager {
  if (!instance) {
    instance = new SyncManager({
      noteRepo: createSyncRepository(db.notes),
      folderRepo: createSyncRepository(db.folders),
      syncStateRepo: createSyncStateRepository(db.syncState),
      toNoteDTO,
      toFolderDTO,
      applyInitialSnapshot: (payload) => applyInitialSnapshot(db, payload),
      applyChangeBatch: (payload) => applyChangeBatch(db, payload),
      api: createSupabaseSyncApi(supabase),
      debounceMs: SYNC_CONFIG.debounceMs,
      heartbeatMs: SYNC_CONFIG.heartbeatMs,
      pushChunkSize: SYNC_CONFIG.pushChunkSize,
      onSuccessSync
    });
  }
  return instance;
}

