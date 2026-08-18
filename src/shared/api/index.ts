import { supabase } from "../config/supabase";

export async function healthCheck(): Promise<boolean> {
  const { data, error } = await supabase.rpc("health_check");
  if (error) throw error;
  return data as boolean;
}
