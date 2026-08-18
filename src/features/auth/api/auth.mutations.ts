import { useMutation } from "@tanstack/react-query";
import { OfflineActionError } from "../model/types";
import { signIn, signOut, signUp, type SignInPayload, type SignUpPayload } from ".";


export function useSignIn(getIsOnline: () => boolean) {
  return useMutation({
    mutationKey: ["auth", "sign-in"],
    mutationFn: async (payload: SignInPayload) => {
      if (!getIsOnline()) throw new OfflineActionError("Sign in");
      await signIn(payload);
    },
  });
}

export function useSignUp(getIsOnline: () => boolean) {
  return useMutation({
    mutationKey: ["auth", "sign-up"],
    mutationFn: async (payload: SignUpPayload) => {
      if (!getIsOnline()) throw new OfflineActionError("Sign up");
      await signUp(payload);
    },
  });
}


export function useSignOut(getIsOnline: () => boolean) {
  return useMutation({
    mutationKey: ["auth", "sign-out"],
    mutationFn: async () => {
      const online = getIsOnline();
      try {
        await signOut(online ? "global" : "local");
      } catch (error) {
        if (online) throw error;
      }
    },
  });
}