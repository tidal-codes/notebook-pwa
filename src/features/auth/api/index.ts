import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/shared/config/supabase";

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
}

export type SignOutScope = "global" | "local";

export async function signIn({
  email,
  password,
}: SignInPayload): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp({
  email,
  password,
  fullName,
}: SignUpPayload): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { fullName } },
  });
  if (error) throw error;
}

export async function signOut(scope: SignOutScope): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope });
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export function startAutoRefresh() {
  return supabase.auth.startAutoRefresh();
}

export function stopAutoRefresh() {
  return supabase.auth.stopAutoRefresh();
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange(callback);
}
