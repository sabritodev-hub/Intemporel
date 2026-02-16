// Fonction pour vérifier si on est en mode démo
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  // Mode démo seulement si l'URL contient "votre-projet" ou est vide
  return !url || url.includes("votre-projet");
}
