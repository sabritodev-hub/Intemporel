import Link from "next/link";
import { cn } from "@/lib/utils";
import { plage } from "@/lib/reservation/dates";
import type { Etat } from "@/lib/reservation/etats";
import JaugeRemplissage from "./JaugeRemplissage";

interface CreneauCardProps {
  href: string;
  debut: Date;
  fin: Date;
  capacite: number;
  couvertsReserves: number;
  placesRestantes: number;
  etat: Etat;
}

export default function CreneauCard({
  href,
  debut,
  fin,
  capacite,
  couvertsReserves,
  placesRestantes,
  etat,
}: CreneauCardProps) {
  if (etat === "ferme") {
    return (
      <div className="rounded-xl border border-dashed border-[#c3bda2] bg-[#EFEDDB] p-5 text-center">
        <p className="font-montserrat text-sm text-ferme">
          Réservations closes — le premier service de la journée a commencé.
        </p>
      </div>
    );
  }

  if (etat === "complet") {
    return (
      <div className="rounded-xl border border-[#d9d4b4] bg-[#EFEDDB] p-5">
        <p className="font-playfair text-xl text-ferme">{plage(debut, fin)}</p>
        <p className="mt-1 font-montserrat text-sm font-semibold text-bordeaux">Complet</p>
        <JaugeRemplissage
          occupees={couvertsReserves}
          capacite={capacite}
          etat={etat}
          className="mt-3"
        />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl border-[1.5px] bg-white p-5 transition-shadow hover:shadow-[0_16px_34px_rgba(128,0,32,.14)]",
        "border-dispo",
      )}
    >
      <p className="font-playfair text-xl text-bordeaux">{plage(debut, fin)}</p>
      <p className="mt-1 font-montserrat text-sm font-semibold text-dispo">
        {placesRestantes} place{placesRestantes > 1 ? "s" : ""} restante
        {placesRestantes > 1 ? "s" : ""}
      </p>
      <JaugeRemplissage
        occupees={couvertsReserves}
        capacite={capacite}
        etat={etat}
        className="mt-3"
      />
      <span className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-bordeaux px-4 font-montserrat text-sm font-semibold text-beige-light transition-colors hover:bg-bordeaux-dark">
        Choisir ce créneau
      </span>
    </Link>
  );
}
