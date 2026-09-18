"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { reservationSchema } from "@/lib/reservation/schemas";
import { normaliser } from "@/lib/reservation/telephone";
import { genererToken } from "@/lib/reservation/token";
import { genererReference } from "@/lib/reservation/reference";
import { verifierTurnstile } from "@/lib/reservation/turnstile";
import { verifierRateLimit } from "@/lib/reservation/rate-limit";
import { messageErreur } from "@/lib/reservation/erreurs";
import { afficher } from "@/lib/reservation/telephone";
import { createAdminClient } from "@/lib/supabase/admin";
import { config } from "@/lib/config";
import { envoyer } from "@/lib/email/envoyer";
import Confirmation from "@/lib/email/templates/Confirmation";

export interface ReservationFormInput {
  creneauId: string;
  nom: string;
  email: string;
  telephone: string;
  couverts: number;
  consentement: boolean;
  turnstileToken: string;
  honeypot: string;
}

export interface ReserverResultat {
  error?: string;
  complet?: boolean;
  success?: boolean;
}

function ipDemandeur(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
}

export async function reserver(input: ReservationFormInput): Promise<ReserverResultat> {
  // Honeypot rempli : faux succès, rien n'est inséré. Un robot qui croit
  // avoir réussi passe au suivant plutôt que de réessayer.
  if (input.honeypot.trim() !== "") {
    return { success: true };
  }

  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const data = parsed.data;

  const ip = ipDemandeur();

  const autorise = await verifierRateLimit(ip);
  if (!autorise) {
    return { error: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  const turnstileOk = await verifierTurnstile(data.turnstileToken, ip);
  if (!turnstileOk) {
    return { error: "Vérification anti-robot échouée. Réessayez." };
  }

  const telephoneE164 = normaliser(data.telephone);
  if (!telephoneE164) {
    return { error: "Numéro de téléphone invalide." };
  }

  const { token, hash } = genererToken();
  let reference = genererReference();

  const supabase = createAdminClient();

  let id: string | null = null;
  let derniereErreur: unknown = null;

  for (let essai = 0; essai < 3 && !id; essai++) {
    const { data: resaId, error } = await supabase.rpc("reserver", {
      p_creneau_id: data.creneauId,
      p_nom: data.nom,
      p_email: data.email,
      p_telephone: telephoneE164,
      p_couverts: data.couverts,
      p_token_hash: hash,
      p_reference: reference,
    });

    if (!error) {
      id = resaId;
      break;
    }

    derniereErreur = error;
    // Collision de référence (contrainte unique) : on retente avec une
    // nouvelle référence. Toute autre erreur est définitive.
    if ((error as { code?: string }).code === "23505" && essai < 2) {
      reference = genererReference();
      continue;
    }
    break;
  }

  if (!id) {
    const message = messageErreur(derniereErreur);
    const brut = (derniereErreur as { message?: string })?.message ?? "";
    return { error: message, complet: brut.startsWith("COMPLET") };
  }

  // La réservation existe déjà en base : un échec d'email ne doit jamais
  // faire échouer la réservation ni remonter d'erreur au client.
  let emailKo = false;
  try {
    const { data: creneau } = await supabase
      .from("creneaux")
      .select("debut, fin")
      .eq("id", data.creneauId)
      .single();

    if (!creneau) throw new Error("Créneau introuvable pour l'email de confirmation");

    const cfg = await config();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

    await envoyer({
      to: data.email,
      subject: `Votre brunch du ${new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Europe/Paris",
      }).format(new Date(creneau.debut))} est confirmé`,
      react: Confirmation({
        nom: data.nom,
        debut: new Date(creneau.debut),
        fin: new Date(creneau.fin),
        couverts: data.couverts,
        reference,
        token,
        siteUrl,
        adresse: cfg.adresse_restaurant ?? "",
        telephoneAffiche: cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null,
      }),
    });
  } catch (e) {
    console.error("[email] confirmation échouée", { reservationId: id, e });
    emailKo = true;
  }

  redirect(`/reservation/confirmation/${id}${emailKo ? "?email=ko" : ""}`);
}
