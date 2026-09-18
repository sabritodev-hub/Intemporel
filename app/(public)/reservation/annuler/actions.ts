"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { config } from "@/lib/config";
import { afficher } from "@/lib/reservation/telephone";
import { messageErreur } from "@/lib/reservation/erreurs";
import { envoyer } from "@/lib/email/envoyer";
import AnnulationClient from "@/lib/email/templates/AnnulationClient";

export async function annulerReservation(tokenHash: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("annuler_par_token", {
    p_token_hash: tokenHash,
  });

  if (error) {
    return { error: messageErreur(error) };
  }

  const resa = data?.[0];
  if (!resa) {
    return { error: "Ce lien n'est plus valable." };
  }

  try {
    const cfg = await config();
    await envoyer({
      to: resa.email,
      subject: `Votre réservation du ${new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        timeZone: "Europe/Paris",
      }).format(new Date(resa.debut))} est annulée`,
      react: AnnulationClient({
        nom: resa.nom,
        debut: new Date(resa.debut),
        couverts: resa.couverts,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
        adresse: cfg.adresse_restaurant ?? "",
        telephoneAffiche: cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null,
      }),
    });
  } catch (e) {
    // L'annulation est déjà actée en base : un échec d'email ne doit pas
    // le remonter comme une erreur au client.
    console.error("[email] annulation client échouée", { reservationId: resa.id, e });
  }

  return {};
}
