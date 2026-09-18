import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { jourLong } from "@/lib/reservation/dates";
import { afficher } from "@/lib/reservation/telephone";
import { etatCreneau } from "@/lib/reservation/etats";
import CreneauCard from "@/components/reservation/CreneauCard";
import type { CreneauPublic } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function ChoixCreneauPage({
  params,
}: {
  params: { date: string };
}) {
  const supabase = createClient();
  const cfg = await config();

  const { data } = await supabase
    .from("creneaux_publics")
    .select("*")
    .eq("jour", params.date)
    .order("debut");

  const creneaux = (data ?? []) as CreneauPublic[];
  const telephone = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="rounded-xl bg-bordeaux p-6">
        <Link
          href="/reservation"
          className="mb-3 inline-flex items-center gap-1 font-montserrat text-sm text-beige-light/80 hover:text-beige-light"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
        <p className="font-montserrat text-xs uppercase tracking-[.18em] text-beige-light/70">
          Étape 2 sur 3
        </p>
        <h1 className="mt-1 font-playfair text-2xl capitalize text-beige-light">
          {jourLong(new Date(`${params.date}T12:00:00Z`))}
        </h1>
      </div>

      {creneaux.length === 0 ? (
        <p className="rounded-lg bg-beige-darker/50 p-6 text-center text-sm text-bordeaux/60">
          Aucun créneau n'est proposé pour cette date.
        </p>
      ) : (
        <div className="space-y-4">
          {creneaux.map((c) => {
            const etat = etatCreneau({
              places_restantes: c.places_restantes ?? 0,
              capacite: c.capacite ?? 0,
              statut: c.statut ?? "annule",
              reservable: c.reservable ?? false,
              journee_close: c.journee_close ?? true,
            });

            return (
              <CreneauCard
                key={c.id}
                href={`/reservation/${params.date}/${c.id}`}
                debut={new Date(c.debut!)}
                fin={new Date(c.fin!)}
                capacite={c.capacite ?? 0}
                couvertsReserves={c.couverts_reserves ?? 0}
                placesRestantes={c.places_restantes ?? 0}
                etat={etat}
              />
            );
          })}
        </div>
      )}

      {telephone && (
        <div className="rounded-lg border border-bordeaux/15 p-4 text-center font-montserrat text-sm text-bordeaux/70">
          Plus de 12 personnes ?{" "}
          <a href={`tel:${telephone.replace(/\s/g, "")}`} className="font-semibold text-bordeaux underline">
            Contactez-nous par téléphone au {telephone}
          </a>
        </div>
      )}
    </div>
  );
}
