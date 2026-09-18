import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { config } from "@/lib/config";
import { hasher } from "@/lib/reservation/token";
import { jourLong, heure } from "@/lib/reservation/dates";
import { afficher } from "@/lib/reservation/telephone";
import BoutonAnnuler from "./BoutonAnnuler";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function LienInvalide({ telephoneAffiche }: { telephoneAffiche: string | null }) {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-16 text-center">
      <h1 className="font-playfair text-2xl font-bold text-bordeaux">
        Ce lien n'est plus valable
      </h1>
      <Link
        href="/reservation"
        className="inline-flex min-h-[48px] items-center rounded-lg bg-bordeaux px-5 font-montserrat text-sm font-semibold text-beige-light hover:bg-bordeaux-dark"
      >
        Réserver un créneau
      </Link>
      {telephoneAffiche && (
        <p className="font-montserrat text-sm text-bordeaux/70">
          Une question ?{" "}
          <a href={`tel:${telephoneAffiche.replace(/\s/g, "")}`} className="underline">
            {telephoneAffiche}
          </a>
        </p>
      )}
    </div>
  );
}

export default async function AnnulerPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const cfg = await config();
  const telephoneAffiche = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;

  if (!searchParams.token) {
    return <LienInvalide telephoneAffiche={telephoneAffiche} />;
  }

  const tokenHash = hasher(searchParams.token);
  const supabase = createAdminClient();

  const { data } = await supabase.rpc("consulter_par_token", { p_token_hash: tokenHash });
  const resa = data?.[0];

  if (!resa) {
    return <LienInvalide telephoneAffiche={telephoneAffiche} />;
  }

  const debut = new Date(resa.debut);

  // État 3 — déjà annulée
  if (resa.statut !== "confirmee") {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-16 text-center">
        <h1 className="font-playfair text-2xl font-bold text-bordeaux">Déjà annulée</h1>
        <div className="space-y-1 rounded-xl border border-bordeaux/10 bg-white p-5 opacity-[.55]">
          <p className="font-playfair text-lg capitalize text-bordeaux">{jourLong(debut)}</p>
          <p className="font-montserrat text-sm text-bordeaux/70">
            {heure(debut)} · {resa.couverts} personnes
          </p>
          {resa.annule_at && (
            <p className="font-montserrat text-xs text-bordeaux/50">
              Annulée le {jourLong(new Date(resa.annule_at))} à {heure(new Date(resa.annule_at))}
            </p>
          )}
        </div>
        <Link
          href="/reservation"
          className="inline-flex min-h-[48px] items-center rounded-lg border border-bordeaux/30 px-5 font-montserrat text-sm font-semibold text-bordeaux hover:bg-bordeaux hover:text-beige-light"
        >
          Réserver un nouveau créneau
        </Link>
      </div>
    );
  }

  const recap = (
    <div className="space-y-1 rounded-xl border border-bordeaux/10 bg-white p-5">
      <p className="font-playfair text-lg capitalize text-bordeaux">{jourLong(debut)}</p>
      <p className="font-montserrat text-sm text-bordeaux/70">
        {heure(debut)} · {resa.couverts} personnes · Référence {resa.reference}
      </p>
    </div>
  );

  // État 2 — confirmée mais moins de 24 h avant : annulation par téléphone
  if (!resa.annulable) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-12">
        <h1 className="text-center font-playfair text-2xl font-bold text-bordeaux">
          Annulation par téléphone
        </h1>
        {recap}
        {telephoneAffiche && (
          <a
            href={`tel:${telephoneAffiche.replace(/\s/g, "")}`}
            className="block rounded-xl bg-bordeaux p-6 text-center font-playfair text-2xl font-semibold text-beige-light"
          >
            {telephoneAffiche}
          </a>
        )}
        <p className="text-center font-montserrat text-sm text-bordeaux/70">
          Merci de nous prévenir : cela libère la table pour d'autres clients.
        </p>
      </div>
    );
  }

  // État 1 — annulable en ligne
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <h1 className="text-center font-playfair text-2xl font-bold text-bordeaux">
        Annuler ma réservation
      </h1>
      {recap}
      <BoutonAnnuler tokenHash={tokenHash} />
      <p className="text-center font-montserrat text-sm text-bordeaux/60">
        Un email de confirmation d'annulation vous sera envoyé.
      </p>
    </div>
  );
}
