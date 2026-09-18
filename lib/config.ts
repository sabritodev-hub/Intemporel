import { createClient } from "@/lib/supabase/server";

/** Un seul appel par page, jamais un appel par composant. */
export async function config(): Promise<Record<string, string>> {
  const { data } = await createClient().from("site_config").select("key, value");
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
}
