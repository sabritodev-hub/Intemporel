import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Logs de debug côté client
  console.log("🔧 [Supabase Client] Initialisation...");
  console.log(
    "🔧 [Supabase Client] URL:",
    url ? url.substring(0, 30) + "..." : "❌ NON DÉFINIE",
  );
  console.log(
    "🔧 [Supabase Client] Key:",
    key ? "✅ Définie (" + key.substring(0, 20) + "...)" : "❌ NON DÉFINIE",
  );

  if (!url || !key) {
    console.error(
      "❌ [Supabase Client] ERREUR: Variables d'environnement manquantes!",
    );
    console.error("Vérifiez votre fichier .env.local");
  }

  return createBrowserClient<Database>(url!, key!);
}
