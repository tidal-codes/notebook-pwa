import type { Session } from "@supabase/supabase-js";
import type { AuthStatus } from "../model/types";

export function deriveStatus(
  session: Session | null,
  isOnline: boolean,
): AuthStatus {
  if (!session) return "unauthenticated";
  return isOnline ? "authenticated" : "authenticated-offline";
}
