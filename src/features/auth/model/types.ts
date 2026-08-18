import type { Session, User } from "@supabase/supabase-js";

/**
 * The four states the app can be in:
 *  - initializing:          we haven't read local storage yet
 *  - unauthenticated:       no valid session, online or offline
 *  - authenticated:         valid session AND we're online (server-trusted)
 *  - authenticated-offline: cached session found locally, but we cannot
 *                            (and must not) verify it against the server
 *                            right now because we have no connectivity
 */
export type AuthStatus =
  | "initializing"
  | "unauthenticated"
  | "authenticated"
  | "authenticated-offline";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  isOnline: boolean;
  error: string | null;
}

/** Thrown when an action that requires connectivity is attempted offline. */
export class OfflineActionError extends Error {
  constructor(action: string) {
    super(`"${action}" is not available offline.`);
    this.name = "OfflineActionError";
  }
}
