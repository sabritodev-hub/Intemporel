import { createClient } from "@/lib/supabase/server";
import MenuContainer from "@/components/menu/MenuContainer";

export const revalidate = 60; // Revalidate every minute

async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data || [];
}

async function getPlats() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plats")
    .select(
      `
      *,
      categories (*),
      plat_options (
        options (
          *,
          option_types (*)
        )
      )
    `,
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching plats:", error);
    return [];
  }
  return data || [];
}

async function getSiteConfig(key: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    // Si la config n'existe pas encore, retourner la valeur par défaut
    return null;
  }
  return (data as { value: string | null }).value;
}

export default async function HomePage() {
  const [categories, plats, showCounterButtonConfig] = await Promise.all([
    getCategories(),
    getPlats(),
    getSiteConfig("show_counter_button"),
  ]);

  // Par défaut, le bouton est affiché (true)
  const showCounterButton = showCounterButtonConfig !== "false";

  return (
    <MenuContainer
      categories={categories}
      plats={plats}
      showCounterButton={showCounterButton}
    />
  );
}
