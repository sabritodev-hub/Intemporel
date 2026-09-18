import Link from "next/link";
import { cn } from "@/lib/utils";
import { jourLong, heure } from "@/lib/reservation/dates";
import { etatCreneau, meilleurEtatJour, LIBELLE_ETAT, type Etat } from "@/lib/reservation/etats";
import type { CreneauPublic } from "@/types/database.types";

const STYLE_BADGE: Record<Etat, string> = {
  dispo: "border-dispo text-dispo",
  presque: "border-presque text-presque",
  complet: "border-bordeaux text-bordeaux",
  ferme: "border-ferme text-ferme",
};

interface CalendrierSemaineProps {
  jours: string[]; // clés de jour triées, ex "2026-10-11"
  creneauxParJour: Record<string, CreneauPublic[]>;
}

export default function CalendrierSemaine({ jours, creneauxParJour }: CalendrierSemaineProps) {
  if (jours.length === 0) {
    return (
      <p className="rounded-lg bg-beige-darker/50 p-6 text-center text-sm text-bordeaux/60">
        Aucun brunch programmé pour le moment sur cette période.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {jours.map((jour) => {
        const creneaux = [...(creneauxParJour[jour] ?? [])].sort((a, b) =>
          (a.debut ?? "").localeCompare(b.debut ?? ""),
        );
        const etatsCreneaux = creneaux.map((c) =>
          etatCreneau({
            places_restantes: c.places_restantes ?? 0,
            capacite: c.capacite ?? 0,
            statut: c.statut ?? "annule",
            reservable: c.reservable ?? false,
            journee_close: c.journee_close ?? true,
          }),
        );
        const etatJour = meilleurEtatJour(etatsCreneaux);

        return (
          <div key={jour} className="overflow-hidden rounded-xl border border-bordeaux/10">
            <div className="flex items-center justify-between bg-beige-darker px-4 py-3">
              <p className="font-playfair text-base capitalize text-bordeaux">
                {jourLong(new Date(`${jour}T12:00:00Z`))}
              </p>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 font-montserrat text-[10.5px] font-semibold uppercase tracking-wide",
                  STYLE_BADGE[etatJour],
                )}
              >
                {LIBELLE_ETAT[etatJour]}
              </span>
            </div>

            <div className="divide-y divide-[#f0ead4] bg-white">
              {creneaux.map((c, i) => {
                const etat = etatsCreneaux[i];
                const debut = new Date(c.debut!);
                const fin = new Date(c.fin!);

                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-playfair text-base text-bordeaux">
                        {heure(debut)} – {heure(fin)}
                      </p>
                      {etat === "ferme" ? (
                        <p className="text-sm text-ferme">Fermé</p>
                      ) : etat === "complet" ? (
                        <p className="text-sm font-semibold text-bordeaux">Complet</p>
                      ) : (
                        <p className={cn("text-sm font-semibold", etat === "presque" ? "text-presque" : "text-dispo")}>
                          {c.places_restantes} place{(c.places_restantes ?? 0) > 1 ? "s" : ""} restante
                          {(c.places_restantes ?? 0) > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    {(etat === "dispo" || etat === "presque") && (
                      <Link
                        href={`/reservation/${jour}/${c.id}`}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-bordeaux px-4 font-montserrat text-sm font-semibold text-beige-light hover:bg-bordeaux-dark"
                      >
                        Choisir
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
