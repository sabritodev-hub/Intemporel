import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

async function getSiteConfig() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .order("key");

  if (error) {
    console.error("Error fetching site config:", error);
    return [];
  }

  return data || [];
}

export default async function SettingsPage() {
  const config = await getSiteConfig();

  // Convertir en objet clé-valeur
  const configMap: Record<string, string> = {};
  config.forEach((item: { key: string; value: string | null }) => {
    configMap[item.key] = item.value || "";
  });

  return <SettingsClient initialConfig={configMap} />;
}
