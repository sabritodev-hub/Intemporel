import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function getImageUrl(path: string | null): string {
  console.log("🖼️ [getImageUrl] Input path:", path);

  if (!path) {
    console.log("🖼️ [getImageUrl] No path, using placeholder");
    return "/images/placeholder-dessert.svg";
  }

  if (path.startsWith("http")) {
    console.log("🖼️ [getImageUrl] Path is already a full URL:", path);
    return path;
  }

  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "desserts-images";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const fullUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

  console.log("🖼️ [getImageUrl] Bucket:", bucket);
  console.log("🖼️ [getImageUrl] Supabase URL:", supabaseUrl);
  console.log("🖼️ [getImageUrl] Full URL:", fullUrl);

  return fullUrl;
}
