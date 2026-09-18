import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { jourLong, plage } from "@/lib/reservation/dates";
import { afficher } from "@/lib/reservation/telephone";
import FormulaireReservation from "@/components/reservation/FormulaireReservation";
import type { CreneauPublic } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function FormulairePage({
  params,
}: {
  params: { date: string; creneauId: string };
}) {
  const supabase = createClient();
  const cfg = await config();

  const { data } = await supabase
    .from("creneaux_publics")
    .select("*")
    .eq("id", params.creneauId)
    .single();

  const creneau = data as CreneauPublic | null;

  // On ne bloque pas ici sur `reservable` : la disponibilité peut changer
  // entre le chargement de la page et l'envoi du formulaire. C'est reserver()
  // qui fait foi et renvoie l'erreur exacte (COMPLET, RESERVATIONS_CLOSES...),
  // affichée par FormulaireReservation. Seul un créneau inexistant est 404.
  if (!creneau) {
    notFound();
  }

  const telephone = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;
  const debut = new Date(creneau.debut!);
  const fin = new Date(creneau.fin!);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="rounded-xl bg-bordeaux p-6">
        <Link
          href={`/reservation/${params.date}`}
          className="mb-3 inline-flex items-center gap-1 font-montserrat text-sm text-beige-light/80 hover:text-beige-light"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <p className="font-montserrat text-xs uppercase tracking-[.18em] text-beige-light/70">
          Étape 3 sur 3 · Vos coordonnées
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-bordeaux/10 bg-white p-4">
        <div>
          <p className="font-montserrat text-xs uppercase tracking-wide text-bordeaux/60">
            Votre créneau
          </p>
          <p className="font-playfair text-lg capitalize text-bordeaux">
            {jourLong(new Date(`${params.date}T12:00:00Z`))}
          </p>
          <p className="font-playfair text-base text-bordeaux/80">{plage(debut, fin)}</p>
        </div>
        <Link
          href={`/reservation/${params.date}`}
          className="flex min-h-[44px] items-center rounded-lg border border-bordeaux/30 px-3 font-montserrat text-sm font-semibold text-bordeaux hover:bg-bordeaux hover:text-beige-light"
        >
          Modifier
        </Link>
      </div>

      <FormulaireReservation
        creneauId={creneau.id!}
        date={params.date}
        telephoneAffiche={telephone}
      />
    </div>
  );
}
