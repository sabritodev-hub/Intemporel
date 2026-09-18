"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { annulerCreneauAdmin, type ClientAnnule } from "./actions";

interface AnnulerCreneauModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creneauId: string;
  jourHeure: string; // ex. "Dim. 11 oct. · 12h30 – 14h30"
  nbReservations: number;
  nbCouverts: number;
}

export default function AnnulerCreneauModal({
  open,
  onOpenChange,
  creneauId,
  jourHeure,
  nbReservations,
  nbCouverts,
}: AnnulerCreneauModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [etape, setEtape] = useState<"avant" | "apres">("avant");
  const [motif, setMotif] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientAnnule[]>([]);
  const [appeles, setAppeles] = useState<Set<string>>(new Set());

  const fermer = () => {
    onOpenChange(false);
    // Laisser l'animation de fermeture se jouer avant de réinitialiser.
    setTimeout(() => {
      setEtape("avant");
      setMotif("");
      setErreur(null);
      setClients([]);
      setAppeles(new Set());
    }, 200);
  };

  const handleConfirmer = async () => {
    if (motif.trim() === "") {
      setErreur("Indiquez le motif : il sera repris dans l'email envoyé aux clients.");
      return;
    }
    setIsLoading(true);
    setErreur(null);
    const resultat = await annulerCreneauAdmin(creneauId, motif);
    setIsLoading(false);

    if (resultat.error) {
      setErreur(resultat.error);
      return;
    }

    setClients(resultat.clients ?? []);
    setEtape("apres");
    router.refresh();
  };

  const basculerAppele = (id: string) => {
    setAppeles((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(id)) suivant.delete(id);
      else suivant.add(id);
      return suivant;
    });
  };

  const terminer = () => {
    toast({ title: "Créneau annulé", description: "Les clients ont été prévenus." });
    fermer();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && fermer()}>
      <DialogContent className="max-w-lg">
        {etape === "avant" ? (
          <>
            <DialogHeader>
              <DialogTitle>Annuler le créneau</DialogTitle>
              <DialogDescription>{jourHeure}</DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-bordeaux p-4 font-montserrat text-sm text-beige-light">
              <strong>
                {nbReservations} réservation{nbReservations > 1 ? "s" : ""} ·{" "}
                {nbCouverts} couvert{nbCouverts > 1 ? "s" : ""}
              </strong>{" "}
              seront annulés. Un email d'annulation sera envoyé à chaque client.
            </div>

            <div className="space-y-2">
              <Label htmlFor="motif">Motif (visible dans l'email)</Label>
              <Textarea
                id="motif"
                value={motif}
                onChange={(e) => {
                  setMotif(e.target.value);
                  setErreur(null);
                }}
                rows={3}
                className="min-h-[80px]"
                placeholder="Ex : Fermeture exceptionnelle de la cuisine"
              />
              {erreur && <p className="text-[11px] font-semibold text-bordeaux">{erreur}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={fermer}>
                Retour
              </Button>
              <Button variant="destructive" onClick={handleConfirmer} disabled={isLoading}>
                {isLoading ? "Annulation..." : "Annuler le créneau et prévenir"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Clients à appeler</DialogTitle>
              <DialogDescription>Emails envoyés · cochez au fur et à mesure</DialogDescription>
            </DialogHeader>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {clients.map((c) => {
                const appele = appeles.has(c.id);
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-lg border border-bordeaux/10 p-3"
                  >
                    <Checkbox
                      checked={appele}
                      onCheckedChange={() => basculerAppele(c.id)}
                      className="h-[22px] w-[22px]"
                    />
                    <div className="flex-1">
                      <p className={cn("font-montserrat text-sm text-bordeaux", appele && "text-ferme")}>
                        {c.nom} · {c.couverts} pers.
                      </p>
                      <a
                        href={`tel:${c.telephone.replace(/\s/g, "")}`}
                        className="text-sm text-bordeaux underline"
                      >
                        {c.telephone}
                      </a>
                    </div>
                    <span className="font-montserrat text-xs font-semibold text-bordeaux/60">
                      {appele ? "Appelé" : "À appeler"}
                    </span>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button onClick={terminer}>Terminer</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
