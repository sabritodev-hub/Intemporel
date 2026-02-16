import { createClient } from '@/lib/supabase/server'
import MenuContainer from '@/components/menu/MenuContainer'

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

export default async function HomePage() {
  const [categories, plats] = await Promise.all([getCategories(), getPlats()]);

  return <MenuContainer categories={categories} plats={plats} />
}
