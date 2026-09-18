"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { normaliser, afficher } from "@/lib/reservation/telephone";
import { genererReference } from "@/lib/reservation/reference";
import { envoyer } from "@/lib/email/envoyer";
import AnnulationRestaurant from "@/lib/email/templates/AnnulationRestaurant";

function revaliderTout() {
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/creneaux");
  revalidatePath("/admin/dashboard");
  revalidatePath("/reservation");
}

export async function marquerVenu(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("reservations").update({ statut: "venue" } as any).eq("id", id);
  if (error) return { error: error.message };
  revaliderTout();
  return { success: true };
}

export async function marquerAbsent(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("reservations").update({ statut: "absent" } as any).eq("id", id);
  if (error) return { error: error.message };
  revaliderTout();
  return { success: true };
}

export async function annulerReservationAdmin(
  id: string,
  motif: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = createClient();

  const { data: resa } = await supabase
    .from("reservations")
    .select("nom, email, couverts, creneaux(debut)")
    .eq("id", id)
    .single();

  if (!resa) return { error: "Réservation introuvable." };

  const { error } = await supabase
    .from("reservations")
    .update({ statut: "annulee_restaurant", annule_at: new Date().toISOString() } as any)
    .eq("id", id);

  if (error) return { error: error.message };

  const creneauInfo = resa.creneaux as unknown as { debut: string } | null;

  if (resa.email && creneauInfo) {
    try {
      const cfg = await config();
      await envoyer({
        to: resa.email,
        subject: `Nous devons annuler votre brunch du ${new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "long",
          timeZone: "Europe/Paris",
        }).format(new Date(creneauInfo.debut))}`,
        react: AnnulationRestaurant({
          nom: resa.nom ?? "",
          debut: new Date(creneauInfo.debut),
          couverts: resa.couverts,
          motif,
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
          adresse: cfg.adresse_restaurant ?? "",
          telephoneAffiche: cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null,
        }),
      });
    } catch (e) {
      console.error("[email] annulation restaurant (ligne) échouée", { reservationId: id, e });
    }
  }

  revaliderTout();
  return { success: true };
}

export interface AjoutManuelInput {
  creneauId: string;
  nom: string;
  telephone: string;
  email?: string;
  couverts: number;
  force?: boolean;
}

export interface AjoutManuelResultat {
  error?: string;
  depassement?: { actuel: number; nouveauTotal: number; capacite: number };
  success?: boolean;
}

export async function ajouterReservationManuelle(
  input: AjoutManuelInput,
): Promise<AjoutManuelResultat> {
  const supabase = createClient();

  if (input.nom.trim().length < 2) {
    return { error: "Le nom doit contenir au moins 2 caractères." };
  }
  const telephoneE164 = normaliser(input.telephone);
  if (!telephoneE164) {
    return { error: "Numéro de téléphone invalide." };
  }
  if (!Number.isInteger(input.couverts) || input.couverts < 1 || input.couverts > 50) {
    return { error: "Le nombre de couverts doit être compris entre 1 et 50." };
  }

  const { data: creneau } = await supabase
    .from("creneaux")
    .select("capacite")
    .eq("id", input.creneauId)
    .single();

  if (!creneau) {
    return { error: "Créneau introuvable." };
  }

  const { data: resas } = await supabase
    .from("reservations")
    .select("couverts")
    .eq("creneau_id", input.creneauId)
    .in("statut", ["confirmee", "venue"]);

  const actuel = (resas ?? []).reduce((somme, r) => somme + r.couverts, 0);
  const nouveauTotal = actuel + input.couverts;

  if (nouveauTotal > creneau.capacite && !input.force) {
    return { depassement: { actuel, nouveauTotal, capacite: creneau.capacite } };
  }

  let reference = genererReference();
  let inseree = false;
  let derniereErreur: { message: string; code?: string } | null = null;

  for (let essai = 0; essai < 3 && !inseree; essai++) {
    const { error } = await supabase.from("reservations").insert({
      creneau_id: input.creneauId,
      reference,
      nom: input.nom.trim(),
      email: input.email?.trim() || null,
      telephone: telephoneE164,
      couverts: input.couverts,
      source: "admin",
      statut: "confirmee",
    } as any);

    if (!error) {
      inseree = true;
      break;
    }
    derniereErreur = error;
    if (error.code === "23505" && essai < 2) {
      reference = genererReference();
      continue;
    }
    break;
  }

  if (!inseree) {
    return { error: derniereErreur?.message ?? "Une erreur est survenue lors de l'ajout." };
  }

  revaliderTout();
  return { success: true };
}
