import { useAuth } from "@/features/auth/model/auth-context";
import type { AuthStatus } from "@/features/auth/model/types";

interface CanSyncResult {
  canSync: boolean;
  message: string;
}

export function useCanSync(): CanSyncResult {
  const { status } = useAuth();

  switch (status as AuthStatus) {
    case "authenticated":
      return {
        canSync: true,
        message: "Ready to sync.",
      };

    case "authenticated-offline":
      return {
        canSync: false,
        message: "You are offline. Please connect to the internet to sync.",
      };

    case "unauthenticated":
      return {
        canSync: false,
        message: "You need to sign in before you can sync.",
      };

    case "initializing":
    default:
      return {
        canSync: false,
        message: "Authentication is still being checked. Please wait.",
      };
  }
}
