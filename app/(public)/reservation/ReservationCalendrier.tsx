"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import CalendrierMois from "@/components/reservation/CalendrierMois";
import CalendrierSemaine from "@/components/reservation/CalendrierSemaine";
import type { CreneauPublic } from "@/types/database.types";

const MOIS_LABELS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function labelMois(mois: string) {
  const [y, m] = mois.split("-").map(Number);
  return `${MOIS_LABELS[m - 1]} ${y}`;
}

interface ReservationCalendrierProps {
  mois: string;
  moisCourant: string;
  moisSuivant: string;
  moisCourantADesCreneaux: boolean;
  moisSuivantADesCreneaux: boolean;
  creneauxParJour: Record<string, CreneauPublic[]>;
}

export default function ReservationCalendrier({
  mois,
  moisCourant,
  moisSuivant,
  moisCourantADesCreneaux,
  moisSuivantADesCreneaux,
  creneauxParJour,
}: ReservationCalendrierProps) {
  const [vue, setVue] = useState<"mois" | "semaine">("semaine");

  useEffect(() => {
    if (window.innerWidth >= 768) setVue("mois");
  }, []);

  const precedentActif = mois === moisSuivant && moisCourantADesCreneaux;
  const suivantActif = mois === moisCourant && moisSuivantADesCreneaux;

  const joursDuMois = Object.keys(creneauxParJour)
    .filter((j) => j.startsWith(mois))
    .sort();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="rounded-xl bg-bordeaux p-6 text-center">
        <h1 className="font-playfair text-3xl font-bold text-beige-light">
          Réserver le brunch
        </h1>
        <p className="mt-1 font-montserrat text-sm text-beige-light/80">
          Samedi et dimanche · 1 à 12 personnes
        </p>
      </div>

      <div className="rounded-lg bg-beige-darker/60 p-3 text-center font-montserrat text-sm text-bordeaux/80">
        Les réservations d'une journée ferment à l'heure du premier service de
        cette journée.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-full bg-beige-darker p-1">
          <button
            onClick={() => setVue("semaine")}
            className={cn(
              "rounded-full px-4 py-2 font-montserrat text-sm font-semibold transition-colors",
              vue === "semaine" ? "bg-bordeaux text-beige-light" : "text-bordeaux/70",
            )}
          >
            Semaine
          </button>
          <button
            onClick={() => setVue("mois")}
            className={cn(
              "rounded-full px-4 py-2 font-montserrat text-sm font-semibold transition-colors",
              vue === "mois" ? "bg-bordeaux text-beige-light" : "text-bordeaux/70",
            )}
          >
            Mois
          </button>
        </div>

        <div className="flex items-center gap-2">
          {precedentActif ? (
            <Link
              href={`/reservation?mois=${moisCourant}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-bordeaux/30 text-bordeaux"
            >
              ‹
            </Link>
          ) : (
            <span
              className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-bordeaux/10 text-bordeaux/30"
              aria-disabled="true"
            >
              ‹
            </span>
          )}
          <span className="min-w-[9ch] text-center font-playfair text-sm text-bordeaux">
            {labelMois(mois)}
          </span>
          {suivantActif ? (
            <Link
              href={`/reservation?mois=${moisSuivant}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-bordeaux/30 text-bordeaux"
            >
              ›
            </Link>
          ) : (
            <span
              className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-bordeaux/10 text-bordeaux/30"
              aria-disabled="true"
            >
              ›
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 font-montserrat text-xs text-bordeaux/70">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-dispo" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-presque" /> Presque complet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-bordeaux" /> Complet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ferme" /> Fermé
        </span>
      </div>

      {vue === "mois" ? (
        <CalendrierMois mois={mois} creneauxParJour={creneauxParJour} />
      ) : (
        <CalendrierSemaine jours={joursDuMois} creneauxParJour={creneauxParJour} />
      )}
    </div>
  );
}
