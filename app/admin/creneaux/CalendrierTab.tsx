"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { jourCourt, plage, construireGrilleMois } from "@/lib/reservation/dates";
import type { Etat } from "@/lib/reservation/etats";
import { genererCreneaux, modifierCapacite, fermerCreneau, rouvrirCreneau } from "./actions";
import type { CreneauAvecEtat } from "./CreneauxClient";
import AnnulerCreneauModal from "./AnnulerCreneauModal";

const COULEUR_ETAT: Record<Etat, string> = {
  dispo: "border-dispo text-dispo",
  presque: "border-presque text-presque",
  complet: "border-complet text-complet bg-[#EFEDDB]",
  ferme: "border-ferme text-ferme bg-[#EFEDDB]",
};

const MOIS_LABELS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function labelMois(mois: string) {
  const [y, m] = mois.split("-").map(Number);
  return `${MOIS_LABELS[m - 1]} ${y}`;
}

interface CalendrierTabProps {
  mois: string;
  moisPrecedent: string;
  moisSuivant: string;
  creneauxParJour: Record<string, CreneauAvecEtat[]>;
}

export default function CalendrierTab({
  mois,
  moisPrecedent,
  moisSuivant,
  creneauxParJour,
}: CalendrierTabProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingCapacite, setIsSavingCapacite] = useState(false);
  const [capaciteInput, setCapaciteInput] = useState<string>("");
  const [erreurCapacite, setErreurCapacite] = useState<string | null>(null);
  const [modalAnnulerOuverte, setModalAnnulerOuverte] = useState(false);

  const grille = construireGrilleMois(mois);

  const tousLesCreneaux = Object.values(creneauxParJour).flat();
  const selected = tousLesCreneaux.find((c) => c.id === selectedId) ?? null;

  const selectionner = (c: CreneauAvecEtat) => {
    setSelectedId(c.id);
    setCapaciteInput(String(c.capacite));
    setErreurCapacite(null);
  };

  const handleGenerer = async () => {
    setIsGenerating(true);
    const result = await genererCreneaux(mois);
    setIsGenerating(false);

    if (result.error) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    } else {
      toast({
        title: "Génération terminée",
        description:
          result.count && result.count > 0
            ? `${result.count} créneaux créés`
            : "Aucun nouveau créneau : le mois est déjà généré.",
      });
      router.refresh();
    }
  };

  const handleEnregistrerCapacite = async () => {
    if (!selected) return;
    const capacite = parseInt(capaciteInput, 10);
    if (Number.isNaN(capacite) || capacite <= 0) {
      setErreurCapacite("Indiquez une capacité valide.");
      return;
    }
    if (capacite < selected.couverts_reserves) {
      setErreurCapacite(
        `${selected.couverts_reserves} couverts déjà réservés : la capacité ne peut pas descendre sous ${selected.couverts_reserves}.`,
      );
      return;
    }

    setIsSavingCapacite(true);
    const result = await modifierCapacite(selected.id, capacite);
    setIsSavingCapacite(false);

    if (result.error) {
      setErreurCapacite(result.error);
    } else {
      setErreurCapacite(null);
      toast({ title: "Succès", description: "Capacité mise à jour" });
      router.refresh();
    }
  };

  const handleFermer = async () => {
    if (!selected) return;
    const result = await fermerCreneau(selected.id);
    if (result.error) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Créneau fermé", description: "Plus de nouvelles réservations possibles." });
      router.refresh();
    }
  };

  const handleRouvrir = async () => {
    if (!selected) return;
    const result = await rouvrirCreneau(selected.id);
    if (result.error) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Créneau rouvert" });
      router.refresh();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_288px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href={`/admin/creneaux?mois=${moisPrecedent}`}>
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <span className="min-w-[10ch] text-center font-playfair text-base text-bordeaux">
              {labelMois(mois)}
            </span>
            <Link href={`/admin/creneaux?mois=${moisSuivant}`}>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <Button onClick={handleGenerer} disabled={isGenerating}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
            {isGenerating ? "Génération..." : "Générer les créneaux du mois"}
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-montserrat text-xs font-semibold text-bordeaux/60">
          {["L", "M", "M", "J", "V", "S", "D"].map((j, i) => (
            <div key={i}>{j}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grille.map((jour, i) => {
            if (!jour) {
              return <div key={i} className="min-h-[92px] rounded-lg bg-transparent" />;
            }
            const creneauxDuJour = creneauxParJour[jour] ?? [];
            const numeroJour = jour.slice(-2).replace(/^0/, "");

            return (
              <div
                key={i}
                className="flex min-h-[92px] flex-col gap-1 rounded-lg border border-bordeaux/10 bg-white p-1.5"
              >
                <span className="font-montserrat text-xs text-bordeaux/50">{numeroJour}</span>
                <div className="flex flex-col gap-1">
                  {creneauxDuJour.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectionner(c)}
                      className={cn(
                        "rounded border px-1 py-0.5 text-left font-montserrat text-[10.5px] font-semibold transition-colors",
                        COULEUR_ETAT[c.etat],
                        selectedId === c.id && "ring-2 ring-bordeaux",
                      )}
                    >
                      {new Date(c.debut).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Paris",
                      })}{" "}
                      · {c.capacite}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panneau du créneau sélectionné */}
      <Card className="h-fit">
        <CardContent className="space-y-4 pt-6">
          {!selected ? (
            <p className="text-sm text-bordeaux/60">
              Sélectionnez un créneau dans le calendrier.
            </p>
          ) : (
            <>
              <div>
                <p className="font-playfair text-lg capitalize text-bordeaux">
                  {jourCourt(new Date(selected.debut))} · {plage(new Date(selected.debut), new Date(selected.fin))}
                </p>
                <p className="mt-1 text-sm text-bordeaux/60">
                  {selected.couverts_reserves} couverts sur {selected.capacite} · statut{" "}
                  {selected.statut}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacite-panel">Capacité</Label>
                <div className="flex gap-2">
                  <Input
                    id="capacite-panel"
                    type="number"
                    min={1}
                    value={capaciteInput}
                    onChange={(e) => {
                      setCapaciteInput(e.target.value);
                      setErreurCapacite(null);
                    }}
                  />
                  <Button onClick={handleEnregistrerCapacite} disabled={isSavingCapacite}>
                    {isSavingCapacite ? "..." : "Enregistrer"}
                  </Button>
                </div>
                {erreurCapacite && (
                  <p className="text-[11px] font-semibold text-bordeaux">{erreurCapacite}</p>
                )}
              </div>

              <div className="space-y-2 border-t border-bordeaux/10 pt-4">
                {selected.statut === "ouvert" ? (
                  <Button variant="outline" className="w-full" onClick={handleFermer}>
                    Fermer le créneau
                  </Button>
                ) : selected.statut === "ferme" ? (
                  <Button variant="outline" className="w-full" onClick={handleRouvrir}>
                    Rouvrir le créneau
                  </Button>
                ) : null}

                {selected.statut !== "annule" && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setModalAnnulerOuverte(true)}
                  >
                    Annuler le créneau…
                  </Button>
                )}

                {selected.statut === "annule" && (
                  <p className="text-center text-sm text-ferme">Créneau annulé</p>
                )}

                <p className="text-center text-xs text-bordeaux/50">
                  L'annulation prévient les clients par email et fournit la liste à appeler.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selected && (
        <AnnulerCreneauModal
          open={modalAnnulerOuverte}
          onOpenChange={setModalAnnulerOuverte}
          creneauId={selected.id}
          jourHeure={`${jourCourt(new Date(selected.debut))} · ${plage(new Date(selected.debut), new Date(selected.fin))}`}
          nbReservations={selected.nb_reservations}
          nbCouverts={selected.couverts_reserves}
        />
      )}
    </div>
  );
}
