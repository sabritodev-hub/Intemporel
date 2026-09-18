"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { jourLong, heure } from "@/lib/reservation/dates";
import type { Etat } from "@/lib/reservation/etats";
import JaugeRemplissage from "@/components/reservation/JaugeRemplissage";
import { marquerVenu, marquerAbsent, annulerReservationAdmin } from "./actions";
import AjoutManuelModal from "./AjoutManuelModal";

export interface BlocCreneau {
  creneau: {
    id: string;
    debut: string;
    fin: string;
    capacite: number;
    statut: string;
    couvertsReserves: number;
    etat: Etat;
  };
  jour: string;
  reservations: {
    id: string;
    nom: string;
    telephone: string | null;
    email: string | null;
    couverts: number;
    statut: string;
    createdAt: string;
  }[];
}

const BADGE_STATUT: Record<string, { texte: string; fond: string; couleur: string }> = {
  confirmee: { texte: "Confirmée", fond: "#EAF0EA", couleur: "#3F6B4A" },
  venue: { texte: "Venue", fond: "#F3E7EA", couleur: "#800020" },
  absent: { texte: "Absent", fond: "#F5EFE0", couleur: "#9A6B1F" },
  annulee_client: { texte: "Annulée", fond: "#EFEDDB", couleur: "#8A8778" },
  annulee_restaurant: { texte: "Annulée", fond: "#EFEDDB", couleur: "#8A8778" },
};

const STATUT_BADGE_CRENEAU: Record<string, string> = {
  ouvert: "Ouvert",
  ferme: "Fermé",
  annule: "Annulé",
};

interface ReservationsClientProps {
  vue: "jour" | "semaine";
  date: string;
  blocs: BlocCreneau[];
  jourPrecedent: string | null;
  jourSuivant: string | null;
  semainePrecedente: string;
  semaineSuivante: string;
  creneauxDisponibles: { id: string; debut: string; fin: string }[];
}

export default function ReservationsClient({
  vue,
  date,
  blocs,
  jourPrecedent,
  jourSuivant,
  semainePrecedente,
  semaineSuivante,
  creneauxDisponibles,
}: ReservationsClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [recherche, setRecherche] = useState("");
  const [isAjoutOuvert, setIsAjoutOuvert] = useState(false);
  const [annulerCible, setAnnulerCible] = useState<{ id: string; nom: string } | null>(null);
  const [motif, setMotif] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const rechercheNormalisee = recherche.trim().toLowerCase();

  const blocsFiltres = useMemo(() => {
    if (!rechercheNormalisee) return blocs;
    return blocs
      .map((b) => ({
        ...b,
        reservations: b.reservations.filter((r) =>
          r.nom.toLowerCase().includes(rechercheNormalisee),
        ),
      }))
      .filter((b) => b.reservations.length > 0);
  }, [blocs, rechercheNormalisee]);

  const { couvertsTotal, nbReservations } = useMemo(() => {
    let couverts = 0;
    let nb = 0;
    for (const b of blocs) {
      for (const r of b.reservations) {
        if (r.statut === "annulee_client" || r.statut === "annulee_restaurant") continue;
        couverts += r.couverts;
        nb += 1;
      }
    }
    return { couvertsTotal: couverts, nbReservations: nb };
  }, [blocs]);

  const capaciteTotale = blocs.reduce((s, b) => s + b.creneau.capacite, 0);

  const handleVenu = async (id: string) => {
    const r = await marquerVenu(id);
    if (r.error) toast({ title: "Erreur", description: r.error, variant: "destructive" });
    else router.refresh();
  };

  const handleAbsent = async (id: string) => {
    const r = await marquerAbsent(id);
    if (r.error) toast({ title: "Erreur", description: r.error, variant: "destructive" });
    else router.refresh();
  };

  const handleAnnuler = async () => {
    if (!annulerCible) return;
    if (motif.trim() === "") return;
    setIsLoading(true);
    const r = await annulerReservationAdmin(annulerCible.id, motif);
    setIsLoading(false);
    if (r.error) {
      toast({ title: "Erreur", description: r.error, variant: "destructive" });
      return;
    }
    toast({ title: "Réservation annulée", description: "Un email a été envoyé au client." });
    setAnnulerCible(null);
    setMotif("");
    router.refresh();
  };

  const hrefJour = (j: string) => `/admin/reservations?vue=jour&date=${j}`;
  const hrefSemaine = (j: string) => `/admin/reservations?vue=semaine&date=${j}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-bordeaux">Réservations</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un nom…"
            className="w-[200px]"
          />
          <Button onClick={() => setIsAjoutOuvert(true)} disabled={creneauxDisponibles.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une réservation
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-beige-darker/60 p-3">
        <div className="inline-flex gap-1 rounded-full bg-white p-1">
          <Link
            href={hrefJour(date)}
            className={cn(
              "rounded-full px-4 py-1.5 font-montserrat text-sm font-semibold transition-colors",
              vue === "jour" ? "bg-bordeaux text-beige-light" : "text-bordeaux/70",
            )}
          >
            Jour
          </Link>
          <Link
            href={hrefSemaine(date)}
            className={cn(
              "rounded-full px-4 py-1.5 font-montserrat text-sm font-semibold transition-colors",
              vue === "semaine" ? "bg-bordeaux text-beige-light" : "text-bordeaux/70",
            )}
          >
            Semaine
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {vue === "jour" ? (
            <>
              <Link
                href={jourPrecedent ? hrefJour(jourPrecedent) : "#"}
                aria-disabled={!jourPrecedent}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-bordeaux/30 text-bordeaux",
                  !jourPrecedent && "pointer-events-none opacity-30",
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <span className="min-w-[16ch] text-center font-playfair text-sm capitalize text-bordeaux">
                {jourLong(new Date(`${date}T12:00:00Z`))}
              </span>
              <Link
                href={jourSuivant ? hrefJour(jourSuivant) : "#"}
                aria-disabled={!jourSuivant}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-bordeaux/30 text-bordeaux",
                  !jourSuivant && "pointer-events-none opacity-30",
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href={hrefSemaine(semainePrecedente)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-bordeaux/30 text-bordeaux"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <span className="min-w-[16ch] text-center font-playfair text-sm capitalize text-bordeaux">
                Semaine du {jourLong(new Date(`${date}T12:00:00Z`))}
              </span>
              <Link
                href={hrefSemaine(semaineSuivante)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-bordeaux/30 text-bordeaux"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <div className="flex gap-4 font-montserrat text-sm text-bordeaux">
          <span>
            Couverts <strong>{couvertsTotal}</strong> / {capaciteTotale}
          </span>
          <span>
            Réservations <strong>{nbReservations}</strong>
          </span>
        </div>
      </div>

      {blocsFiltres.length === 0 ? (
        <p className="rounded-lg bg-beige-darker/50 p-6 text-center text-sm text-bordeaux/60">
          Aucune réservation pour cette période.
        </p>
      ) : (
        <div className="space-y-6">
          {blocsFiltres.map((b) => (
            <div key={b.creneau.id} className="overflow-hidden rounded-xl border border-bordeaux/10">
              <div className="space-y-2 bg-[#FBFAF0] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-playfair text-lg text-bordeaux">
                    {heure(new Date(b.creneau.debut))} – {heure(new Date(b.creneau.fin))}
                  </p>
                  <span className="rounded-full border border-bordeaux/20 px-2.5 py-1 font-montserrat text-[10.5px] font-semibold uppercase tracking-wide text-bordeaux">
                    {STATUT_BADGE_CRENEAU[b.creneau.statut] ?? b.creneau.statut}
                  </span>
                </div>
                <JaugeRemplissage
                  occupees={b.creneau.couvertsReserves}
                  capacite={b.creneau.capacite}
                  etat={b.creneau.etat}
                  texte={`${b.creneau.couvertsReserves} couverts sur ${b.creneau.capacite} · ${Math.max(
                    b.creneau.capacite - b.creneau.couvertsReserves,
                    0,
                  )} places restantes`}
                />
              </div>

              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-[#FBFAF0] text-left font-montserrat text-xs uppercase text-bordeaux/60">
                    <tr>
                      <th className="p-3">Nom</th>
                      <th className="p-3">Pers.</th>
                      <th className="p-3">Téléphone</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Réservé le</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.reservations.map((r) => (
                      <tr key={r.id} className="border-t border-[#f0ead4]">
                        <td className="p-3 font-montserrat text-bordeaux">{r.nom}</td>
                        <td className="p-3 font-montserrat text-bordeaux">{r.couverts}</td>
                        <td className="p-3 font-montserrat">
                          {r.telephone ? (
                            <a href={`tel:${r.telephone}`} className="text-bordeaux underline">
                              {r.telephone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className="rounded-full px-2.5 py-1 font-montserrat text-[10.5px] font-semibold uppercase tracking-wide"
                            style={{
                              backgroundColor: BADGE_STATUT[r.statut]?.fond,
                              color: BADGE_STATUT[r.statut]?.couleur,
                            }}
                          >
                            {BADGE_STATUT[r.statut]?.texte ?? r.statut}
                          </span>
                        </td>
                        <td className="p-3 font-montserrat text-xs text-bordeaux/60">
                          {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="p-3">
                          {r.statut === "confirmee" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleVenu(r.id)}>
                                Venu
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAbsent(r.id)}>
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-bordeaux"
                                onClick={() => setAnnulerCible({ id: r.id, nom: r.nom })}
                              >
                                Annuler
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / salle */}
              <div className="space-y-2 bg-white p-3 lg:hidden">
                {b.reservations.map((r) => (
                  <div key={r.id} className="rounded-lg border border-bordeaux/10 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-montserrat font-semibold text-bordeaux">
                        {r.nom} · {r.couverts} pers.
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 font-montserrat text-[10px] font-semibold uppercase"
                        style={{
                          backgroundColor: BADGE_STATUT[r.statut]?.fond,
                          color: BADGE_STATUT[r.statut]?.couleur,
                        }}
                      >
                        {BADGE_STATUT[r.statut]?.texte ?? r.statut}
                      </span>
                    </div>
                    {r.telephone && (
                      <a
                        href={`tel:${r.telephone}`}
                        className="mt-1 flex items-center gap-1 font-montserrat text-sm text-bordeaux underline"
                      >
                        <Phone className="h-3.5 w-3.5" /> {r.telephone}
                      </a>
                    )}
                    {r.statut === "confirmee" && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <Button size="sm" variant="outline" className="min-h-[44px]" onClick={() => handleVenu(r.id)}>
                          Venu
                        </Button>
                        <Button size="sm" variant="outline" className="min-h-[44px]" onClick={() => handleAbsent(r.id)}>
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="min-h-[44px]"
                          onClick={() => setAnnulerCible({ id: r.id, nom: r.nom })}
                        >
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {b.reservations.length === 0 && (
                  <p className="p-2 text-center text-sm text-bordeaux/50">Aucune réservation</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AjoutManuelModal
        open={isAjoutOuvert}
        onOpenChange={setIsAjoutOuvert}
        creneaux={creneauxDisponibles}
      />

      <Dialog open={!!annulerCible} onOpenChange={() => setAnnulerCible(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la réservation de {annulerCible?.nom}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motif-ligne">Motif (visible dans l'email)</Label>
            <Textarea
              id="motif-ligne"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={2}
              placeholder="Ex : Fermeture exceptionnelle"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnulerCible(null)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleAnnuler} disabled={isLoading || motif.trim() === ""}>
              {isLoading ? "Annulation..." : "Annuler et prévenir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
