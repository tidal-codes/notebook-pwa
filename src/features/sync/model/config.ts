export const SYNC_CONFIG = {
  /** Debounce window for `notifyChange()`, in ms. */
  debounceMs: 3_000,
  /** Heartbeat interval for the "sync regardless of changes" timer, in ms. */
  heartbeatMs: 60_000,
  /** Max change-log rows fetched per `sync_pull_changes` call (the RPC's `p_limit`). */
  pullPageSize: 500,
  /**
   * Max dirty records sent per `sync_push_batch` call. Bounds RPC
   * payload size / execution time when a huge number of records are
   * dirty at once (bulk import, or catching up after a long time
   * offline with heavy local editing).
   */
  pushChunkSize: 200,
} as const;