"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";
import type { Etat } from "@/lib/reservation/etats";
import ModelesTab from "./ModelesTab";
import CalendrierTab from "./CalendrierTab";

export type ModeleRow = Database["public"]["Tables"]["modeles_creneaux"]["Row"];

export interface CreneauAvecEtat {
  id: string;
  debut: string;
  fin: string;
  capacite: number;
  statut: "ouvert" | "ferme" | "annule";
  couverts_reserves: number;
  places_restantes: number;
  nb_reservations: number;
  etat: Etat;
}

interface CreneauxClientProps {
  modeles: ModeleRow[];
  mois: string;
  moisPrecedent: string;
  moisSuivant: string;
  creneauxParJour: Record<string, CreneauAvecEtat[]>;
}

export default function CreneauxClient({
  modeles,
  mois,
  moisPrecedent,
  moisSuivant,
  creneauxParJour,
}: CreneauxClientProps) {
  const [onglet, setOnglet] = useState<"modeles" | "calendrier">("calendrier");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-bordeaux">
          Créneaux
        </h1>
        <p className="mt-1 font-montserrat text-bordeaux/70">
          Un modèle décrit un service récurrent. La génération mensuelle crée
          les créneaux réels à partir des modèles actifs.
        </p>
      </div>

      <div className="inline-flex gap-1 rounded-full bg-beige-darker p-1">
        <button
          onClick={() => setOnglet("calendrier")}
          className={cn(
            "rounded-full px-4 py-2 font-montserrat text-sm font-semibold transition-colors",
            onglet === "calendrier"
              ? "bg-bordeaux text-beige-light"
              : "text-bordeaux/70 hover:text-bordeaux",
          )}
        >
          Calendrier
        </button>
        <button
          onClick={() => setOnglet("modeles")}
          className={cn(
            "rounded-full px-4 py-2 font-montserrat text-sm font-semibold transition-colors",
            onglet === "modeles"
              ? "bg-bordeaux text-beige-light"
              : "text-bordeaux/70 hover:text-bordeaux",
          )}
        >
          Modèles
        </button>
      </div>

      {onglet === "modeles" ? (
        <ModelesTab modeles={modeles} />
      ) : (
        <CalendrierTab
          mois={mois}
          moisPrecedent={moisPrecedent}
          moisSuivant={moisSuivant}
          creneauxParJour={creneauxParJour}
        />
      )}
    </div>
  );
}
