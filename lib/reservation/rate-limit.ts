import "server-only";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const LIMITE = 5;
const FENETRE_MINUTES = 10;

/** true si la tentative est autorisée. Enregistre systématiquement la tentative. */
export async function verifierRateLimit(ip: string): Promise<boolean> {
  const ipHash = createHash("sha256")
    .update(ip + (process.env.RATE_LIMIT_SEL ?? ""))
    .digest("hex");

  const supabase = createAdminClient();
  const depuis = new Date(Date.now() - FENETRE_MINUTES * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("reservation_tentatives")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("creee_le", depuis);

  await supabase.from("reservation_tentatives").insert({ ip_hash: ipHash });

  return (count ?? 0) < LIMITE;
}
