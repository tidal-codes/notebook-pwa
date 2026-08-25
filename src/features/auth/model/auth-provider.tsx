import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthContext, type AuthContextValue } from "../model/auth-context";
import type { AuthStatus } from "../model/types";
import { deriveStatus } from "../lib/derive-status";
import {
  getCurrentUser,
  onAuthStateChange,
  signOut,
  startAutoRefresh,
  stopAutoRefresh,
} from "../api";
import { useSignIn, useSignOut, useSignUp } from "../api/auth.mutations";
import { useNetworkStatusContext } from "@/shared/lib/network-status-provider";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, isVerifying: isVerifyingNetwork } =
    useNetworkStatusContext();

  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [error, setError] = useState<string | null>(null);
  console.log(status);

  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const hasInitializedRef = useRef(false);

  const signInMutation = useSignIn(() => isOnlineRef.current);
  const signUpMutation = useSignUp(() => isOnlineRef.current);
  const signOutMutation = useSignOut(() => isOnlineRef.current);

  useEffect(() => {
    if (isOnline) {
      void startAutoRefresh();
    } else {
      void stopAutoRefresh();
    }
  }, [isOnline]);

  useEffect(() => {
    const { data: listener } = onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setStatus(deriveStatus(newSession, isOnlineRef.current));
      if (event === "SIGNED_OUT") setError(null);
      hasInitializedRef.current = true;
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // انتقال بین آنلاین/آفلاین
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    if (isOnline && status === "authenticated-offline" && session) {
      getCurrentUser().then((user) => {
        if (!user) {
          void signOut("local");
        } else {
          setStatus("authenticated");
        }
      });
    }

    if (!isOnline && status === "authenticated") {
      setStatus("authenticated-offline");
    }
  }, [isOnline, status, session]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        await signInMutation.mutateAsync({ email, password });
      } catch (err) {
        setError(toErrorMessage(err));
        throw err;
      }
    },
    [signInMutation],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      setError(null);
      try {
        await signUpMutation.mutateAsync({ email, password, fullName });
      } catch (err) {
        setError(toErrorMessage(err));
        throw err;
      }
    },
    [signUpMutation],
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (err) {
      setError(toErrorMessage(err));
      throw err;
    }
  }, [signOutMutation]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      session,
      isOnline,
      isVerifyingNetwork,
      error,
      signIn,
      signUp,
      handleSignOut,
    }),
    [
      status,
      session,
      isOnline,
      isVerifyingNetwork,
      error,
      signIn,
      signUp,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
