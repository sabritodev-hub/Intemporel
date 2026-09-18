import Link from "next/link";
import { cn } from "@/lib/utils";
import { construireGrilleMois, jourDeSemaine } from "@/lib/reservation/dates";
import { etatCreneau, meilleurEtatJour, type Etat } from "@/lib/reservation/etats";
import type { CreneauPublic } from "@/types/database.types";

const STYLE_JOUR: Record<Etat, string> = {
  dispo: "bg-white border-dispo",
  presque: "bg-white border-presque",
  complet: "bg-[#EFEDDB] border-[#e0c9cf]",
  ferme: "bg-[#EFEDDB] border-[#e0ddc6]",
};

const STYLE_POINT: Record<Etat, string> = {
  dispo: "bg-dispo",
  presque: "bg-presque",
  complet: "bg-bordeaux",
  ferme: "bg-ferme",
};

interface CalendrierMoisProps {
  mois: string;
  creneauxParJour: Record<string, CreneauPublic[]>;
}

export default function CalendrierMois({ mois, creneauxParJour }: CalendrierMoisProps) {
  const grille = construireGrilleMois(mois);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-center font-montserrat text-xs font-semibold text-bordeaux/60">
        {["L", "M", "M", "J", "V", "S", "D"].map((j, i) => (
          <div key={i}>{j}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {grille.map((jour, i) => {
          if (!jour) return <div key={i} className="aspect-square" />;

          const dow = jourDeSemaine(jour);
          const estWeekend = dow === 0 || dow === 6;
          const numero = jour.slice(-2).replace(/^0/, "");

          if (!estWeekend) {
            return (
              <div key={i} className="flex aspect-square items-center justify-center">
                <span className="font-montserrat text-sm text-[#c4bda6]">{numero}</span>
              </div>
            );
          }

          const creneaux = creneauxParJour[jour] ?? [];
          const etat = meilleurEtatJour(
            creneaux.map((c) =>
              etatCreneau({
                places_restantes: c.places_restantes ?? 0,
                capacite: c.capacite ?? 0,
                statut: c.statut ?? "annule",
                reservable: c.reservable ?? false,
                journee_close: c.journee_close ?? true,
              }),
            ),
          );

          const cliquable = etat === "dispo" || etat === "presque" || etat === "complet";
          const contenu = (
            <div
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border",
                STYLE_JOUR[etat],
              )}
            >
              <span
                className={cn(
                  "font-montserrat text-sm",
                  etat === "ferme" ? "text-ferme" : "text-bordeaux",
                )}
              >
                {numero}
              </span>
              <span className={cn("h-1.5 w-1.5 rounded-full", STYLE_POINT[etat])} />
            </div>
          );

          return cliquable ? (
            <Link key={i} href={`/reservation/${jour}`} aria-label={`Réserver le ${jour}`}>
              {contenu}
            </Link>
          ) : (
            <div key={i} aria-disabled="true">
              {contenu}
            </div>
          );
        })}
      </div>
    </div>
  );
}
