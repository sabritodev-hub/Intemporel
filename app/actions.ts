"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

// ==================== CATEGORIES ====================

export async function createCategory(formData: FormData) {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const order = parseInt(formData.get("order") as string) || 0;

  const { error } = await supabase.from("categories").insert({
    name,
    slug: slugify(name),
    order,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const order = parseInt(formData.get("order") as string) || 0;

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug: slugify(name),
      order,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

// ==================== PLATS ====================

export async function createPlat(data: {
  name: string;
  description?: string;
  price: number;
  image?: string | null;
  available: boolean;
  category_id: string;
  option_ids?: string[];
}) {
  const supabase = createClient();

  // Create plat
  const { data: plat, error } = await supabase
    .from("plats")
    .insert({
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      price: data.price,
      image: data.image,
      available: data.available,
      category_id: data.category_id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Add options if provided
  if (data.option_ids && data.option_ids.length > 0) {
    const platOptions = data.option_ids.map((option_id) => ({
      plat_id: plat.id,
      option_id,
    }));

    await supabase.from("plat_options").insert(platOptions);
  }

  revalidatePath("/admin/plats");
  revalidatePath("/");
  return { success: true, plat };
}

export async function updatePlat(
  id: string,
  data: {
    name: string;
    description?: string;
    price: number;
    image?: string | null;
    available: boolean;
    category_id: string;
    option_ids?: string[];
  },
) {
  const supabase = createClient();

  // Update plat
  const { error } = await supabase
    .from("plats")
    .update({
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      price: data.price,
      image: data.image,
      available: data.available,
      category_id: data.category_id,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Update options
  await supabase.from("plat_options").delete().eq("plat_id", id);

  if (data.option_ids && data.option_ids.length > 0) {
    const platOptions = data.option_ids.map((option_id) => ({
      plat_id: id,
      option_id,
    }));

    await supabase.from("plat_options").insert(platOptions);
  }

  revalidatePath("/admin/plats");
  revalidatePath("/");
  return { success: true };
}

export async function deletePlat(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("plats").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/plats");
  revalidatePath("/");
  return { success: true };
}

export async function togglePlatAvailability(id: string, available: boolean) {
  const supabase = createClient();

  const { error } = await supabase
    .from("plats")
    .update({ available })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/plats");
  revalidatePath("/");
  return { success: true };
}

// ==================== OPTION TYPES ====================

export async function createOptionType(formData: FormData) {
  const supabase = createClient();

  const name = formData.get("name") as string;

  const { error } = await supabase.from("option_types").insert({
    name,
    slug: slugify(name),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/options");
  revalidatePath("/");
  return { success: true };
}

export async function updateOptionType(id: string, formData: FormData) {
  const supabase = createClient();

  const name = formData.get("name") as string;

  const { error } = await supabase
    .from("option_types")
    .update({
      name,
      slug: slugify(name),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/options");
  revalidatePath("/");
  return { success: true };
}

export async function deleteOptionType(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("option_types").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/options");
  revalidatePath("/");
  return { success: true };
}

// ==================== OPTIONS ====================

export async function createOption(data: {
  name: string;
  price_modifier?: number | null;
  option_type_id: string;
}) {
  const supabase = createClient();

  const { error } = await supabase.from("options").insert(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/options");
  revalidatePath("/");
  return { success: true };
}

export async function updateOption(
  id: string,
  data: {
    name: string;
    price_modifier?: number | null;
    option_type_id: string;
  },
) {
  const supabase = createClient();

  const { error } = await supabase.from("options").update(data).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/options");
  revalidatePath("/");
  return { success: true };
}

export async function deleteOption(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("options").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/options");
  revalidatePath("/");
  return { success: true };
}

// ==================== SITE CONFIG ====================

export async function getSiteConfig(key: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", key)
    .single();

  if (error) {
    console.error("Error fetching config:", error);
    return null;
  }

  return data?.value;
}

export async function updateSiteConfig(key: string, value: string) {
  const supabase = createClient();

  const { error } = await supabase.from("site_config").upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "key",
    },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}

export async function getAllSiteConfig() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .order("key");

  if (error) {
    console.error("Error fetching all config:", error);
    return [];
  }

  return data || [];
}
