"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { heure } from "@/lib/reservation/dates";
import { ajouterReservationManuelle } from "./actions";

interface AjoutManuelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creneaux: { id: string; debut: string; fin: string }[];
}

const VIDE = { creneauId: "", nom: "", telephone: "", email: "", couverts: "2" };

export default function AjoutManuelModal({ open, onOpenChange, creneaux }: AjoutManuelModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [valeurs, setValeurs] = useState(VIDE);
  const [erreur, setErreur] = useState<string | null>(null);
  const [depassement, setDepassement] = useState<{
    actuel: number;
    nouveauTotal: number;
    capacite: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fermer = () => {
    onOpenChange(false);
    setValeurs(VIDE);
    setErreur(null);
    setDepassement(null);
  };

  const soumettre = async (force: boolean) => {
    setErreur(null);
    const couverts = parseInt(valeurs.couverts, 10);

    if (!valeurs.creneauId) {
      setErreur("Choisissez un créneau.");
      return;
    }

    setIsLoading(true);
    const resultat = await ajouterReservationManuelle({
      creneauId: valeurs.creneauId,
      nom: valeurs.nom,
      telephone: valeurs.telephone,
      email: valeurs.email || undefined,
      couverts,
      force,
    });
    setIsLoading(false);

    if (resultat.error) {
      setErreur(resultat.error);
      return;
    }
    if (resultat.depassement) {
      setDepassement(resultat.depassement);
      return;
    }

    toast({ title: "Succès", description: "Réservation ajoutée" });
    router.refresh();
    fermer();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && fermer()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une réservation</DialogTitle>
          <DialogDescription>Prise par téléphone ou sur place</DialogDescription>
        </DialogHeader>

        {depassement ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-bordeaux p-4 font-montserrat text-sm text-beige-light">
              Ce créneau passera à {depassement.nouveauTotal} couverts sur {depassement.capacite}.
              Confirmer ?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDepassement(null)}>
                Retour
              </Button>
              <Button onClick={() => soumettre(true)} disabled={isLoading}>
                {isLoading ? "Ajout..." : "Confirmer quand même"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Créneau</Label>
              <Select
                value={valeurs.creneauId}
                onValueChange={(v) => setValeurs({ ...valeurs, creneauId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un créneau" />
                </SelectTrigger>
                <SelectContent>
                  {creneaux.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {heure(new Date(c.debut))} – {heure(new Date(c.fin))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="am-nom">Nom</Label>
              <Input
                id="am-nom"
                value={valeurs.nom}
                onChange={(e) => setValeurs({ ...valeurs, nom: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="am-telephone">Téléphone</Label>
              <Input
                id="am-telephone"
                type="tel"
                value={valeurs.telephone}
                onChange={(e) => setValeurs({ ...valeurs, telephone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="am-couverts">Couverts</Label>
              <Input
                id="am-couverts"
                type="number"
                min={1}
                max={50}
                value={valeurs.couverts}
                onChange={(e) => setValeurs({ ...valeurs, couverts: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="am-email">Email (facultatif)</Label>
              <Input
                id="am-email"
                type="email"
                value={valeurs.email}
                onChange={(e) => setValeurs({ ...valeurs, email: e.target.value })}
              />
              <p className="text-sm text-bordeaux/60">
                Sans email, pas de jeton d'annulation ni d'email de confirmation.
              </p>
            </div>

            {erreur && <p className="text-[11px] font-semibold text-bordeaux">{erreur}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={fermer}>
                Annuler
              </Button>
              <Button onClick={() => soumettre(false)} disabled={isLoading}>
                {isLoading ? "Ajout..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
