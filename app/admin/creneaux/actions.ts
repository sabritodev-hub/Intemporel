"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { afficher } from "@/lib/reservation/telephone";
import { envoyer } from "@/lib/email/envoyer";
import AnnulationRestaurant from "@/lib/email/templates/AnnulationRestaurant";

// ==================== MODÈLES DE CRÉNEAUX ====================

export interface ModeleInput {
  jour_semaine: number; // 0=dimanche, 6=samedi
  heure_debut: string; // "10:00"
  heure_fin: string; // "12:00"
  capacite: number;
  actif: boolean;
}

/** Refuse deux modèles actifs au même jour et à la même heure de début. */
async function verifierConflit(
  supabase: ReturnType<typeof createClient>,
  data: ModeleInput,
  excludeId?: string,
) {
  if (!data.actif) return null;

  let query = supabase
    .from("modeles_creneaux")
    .select("id")
    .eq("jour_semaine", data.jour_semaine)
    .eq("heure_debut", data.heure_debut)
    .eq("actif", true);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data: conflits } = await query;

  if (conflits && conflits.length > 0) {
    return "Un modèle actif existe déjà pour ce jour et cette heure de début.";
  }
  return null;
}

export async function createModele(data: ModeleInput) {
  const supabase = createClient();

  if (data.heure_fin <= data.heure_debut) {
    return { error: "L'heure de fin doit être après l'heure de début." };
  }

  const conflit = await verifierConflit(supabase, data);
  if (conflit) return { error: conflit };

  const { error } = await supabase.from("modeles_creneaux").insert(data as any);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/creneaux");
  return { success: true };
}

export async function updateModele(id: string, data: ModeleInput) {
  const supabase = createClient();

  if (data.heure_fin <= data.heure_debut) {
    return { error: "L'heure de fin doit être après l'heure de début." };
  }

  const conflit = await verifierConflit(supabase, data, id);
  if (conflit) return { error: conflit };

  const { error } = await supabase
    .from("modeles_creneaux")
    .update(data as any)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/creneaux");
  return { success: true };
}

export async function toggleModeleActif(id: string, actif: boolean) {
  const supabase = createClient();

  if (actif) {
    const { data: modele } = await supabase
      .from("modeles_creneaux")
      .select("jour_semaine, heure_debut")
      .eq("id", id)
      .single();

    if (modele) {
      const { data: conflits } = await supabase
        .from("modeles_creneaux")
        .select("id")
        .eq("jour_semaine", modele.jour_semaine)
        .eq("heure_debut", modele.heure_debut)
        .eq("actif", true)
        .neq("id", id);

      if (conflits && conflits.length > 0) {
        return {
          error: "Un modèle actif existe déjà pour ce jour et cette heure de début.",
        };
      }
    }
  }

  const { error } = await supabase
    .from("modeles_creneaux")
    .update({ actif } as any)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/creneaux");
  return { success: true };
}

export async function deleteModele(id: string) {
  const supabase = createClient();

  // on delete set null : les créneaux déjà générés restent, orphelins de modèle.
  const { error } = await supabase.from("modeles_creneaux").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/creneaux");
  return { success: true };
}

// ==================== CRÉNEAUX ====================

export async function genererCreneaux(mois: string) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("generer_creneaux", {
    p_mois: `${mois}-01`,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/creneaux");
  return { success: true, count: data ?? 0 };
}

export async function modifierCapacite(creneauId: string, capacite: number) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("modifier_capacite", {
    p_creneau_id: creneauId,
    p_capacite: capacite,
  });

  if (error) {
    // Le message brut est du type "CAPACITE_TROP_BASSE:18"
    const [code, n] = error.message.split(":");
    if (code.includes("CAPACITE_TROP_BASSE")) {
      return {
        error: `${n} couverts déjà réservés : la capacité ne peut pas descendre sous ${n}.`,
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/creneaux");
  return { success: true, occupees: data ?? 0 };
}

export async function fermerCreneau(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("creneaux")
    .update({ statut: "ferme" } as any)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/creneaux");
  return { success: true };
}

export async function rouvrirCreneau(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("creneaux")
    .update({ statut: "ouvert" } as any)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/creneaux");
  return { success: true };
}

// ==================== ANNULATION D'UN CRÉNEAU (écran 10) ====================

export interface ClientAnnule {
  id: string;
  reference: string;
  nom: string;
  telephone: string;
  couverts: number;
  emailEnvoye: boolean;
}

export async function annulerCreneauAdmin(
  creneauId: string,
  motif: string,
): Promise<{ error?: string; clients?: ClientAnnule[] }> {
  const supabase = createClient();

  const { data: creneau, error: erreurCreneau } = await supabase
    .from("creneaux")
    .select("debut, fin")
    .eq("id", creneauId)
    .single();

  if (erreurCreneau || !creneau) {
    return { error: "Créneau introuvable." };
  }

  const { data: annules, error } = await supabase.rpc("annuler_creneau", {
    p_creneau_id: creneauId,
    p_motif: motif,
  });

  if (error) {
    if (error.message.startsWith("MOTIF_REQUIS")) {
      return { error: "Indiquez le motif : il sera repris dans l'email envoyé aux clients." };
    }
    return { error: error.message };
  }

  const cfg = await config();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const telephoneAffiche = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;
  const debut = new Date(creneau.debut);

  const clients: ClientAnnule[] = [];

  // Envoi séquentiel, avec une petite pause : Resend limite le débit.
  for (const r of annules ?? []) {
    let emailEnvoye = false;
    if (r.email) {
      try {
        await envoyer({
          to: r.email,
          subject: `Nous devons annuler votre brunch du ${new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "long",
            timeZone: "Europe/Paris",
          }).format(debut)}`,
          react: AnnulationRestaurant({
            nom: r.nom,
            debut,
            couverts: r.couverts,
            motif,
            siteUrl,
            adresse: cfg.adresse_restaurant ?? "",
            telephoneAffiche,
          }),
        });
        emailEnvoye = true;
      } catch (e) {
        console.error("[email] annulation restaurant échouée", { reservationId: r.id, e });
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    clients.push({
      id: r.id,
      reference: r.reference,
      nom: r.nom,
      telephone: r.telephone,
      couverts: r.couverts,
      emailEnvoye,
    });
  }

  revalidatePath("/admin/creneaux");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin/dashboard");
  revalidatePath("/reservation");

  return { clients };
}
