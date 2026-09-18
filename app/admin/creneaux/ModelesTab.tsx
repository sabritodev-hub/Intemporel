"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  createModele,
  updateModele,
  toggleModeleActif,
  deleteModele,
  type ModeleInput,
} from "./actions";
import type { ModeleRow } from "./CreneauxClient";

const JOURS: Record<number, string> = { 6: "Samedi", 0: "Dimanche" };

const MODELE_VIDE: ModeleInput = {
  jour_semaine: 6,
  heure_debut: "10:00",
  heure_fin: "12:00",
  capacite: 30,
  actif: true,
};

interface ModelesTabProps {
  modeles: ModeleRow[];
}

export default function ModelesTab({ modeles }: ModelesTabProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creation, setCreation] = useState<ModeleInput>(MODELE_VIDE);

  const [editModele, setEditModele] = useState<ModeleRow | null>(null);
  const [edition, setEdition] = useState<ModeleInput>(MODELE_VIDE);

  const [deleteTarget, setDeleteTarget] = useState<ModeleRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const ouvrirEdition = (m: ModeleRow) => {
    setEditModele(m);
    setEdition({
      jour_semaine: m.jour_semaine,
      heure_debut: m.heure_debut.slice(0, 5),
      heure_fin: m.heure_fin.slice(0, 5),
      capacite: m.capacite,
      actif: m.actif,
    });
  };

  const handleCreate = async () => {
    setIsLoading(true);
    const result = await createModele(creation);
    setIsLoading(false);

    if (result.error) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Modèle créé" });
      setIsCreateOpen(false);
      setCreation(MODELE_VIDE);
      router.refresh();
    }
  };

  const handleUpdate = async () => {
    if (!editModele) return;
    setIsLoading(true);
    const result = await updateModele(editModele.id, edition);
    setIsLoading(false);

    if (result.error) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Modèle mis à jour" });
      setEditModele(null);
      router.refresh();
    }
  };

  const handleToggle = async (m: ModeleRow, actif: boolean) => {
    const result = await toggleModeleActif(m.id, actif);
    if (result.error) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    } else {
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    const result = await deleteModele(deleteTarget.id);
    setIsLoading(false);

    if (result.error) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Modèle supprimé" });
      setDeleteTarget(null);
      router.refresh();
    }
  };

  const groupes = [6, 0]
    .map((jour) => ({ jour, items: modeles.filter((m) => m.jour_semaine === jour) }))
    .filter((g) => g.items.length > 0);

  const champsFormulaire = (
    valeur: ModeleInput,
    setValeur: (v: ModeleInput) => void,
  ) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Jour</Label>
        <Select
          value={String(valeur.jour_semaine)}
          onValueChange={(v) => setValeur({ ...valeur, jour_semaine: Number(v) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Samedi</SelectItem>
            <SelectItem value="0">Dimanche</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="heure_debut">Heure de début</Label>
          <Input
            id="heure_debut"
            type="time"
            value={valeur.heure_debut}
            onChange={(e) => setValeur({ ...valeur, heure_debut: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heure_fin">Heure de fin</Label>
          <Input
            id="heure_fin"
            type="time"
            value={valeur.heure_fin}
            onChange={(e) => setValeur({ ...valeur, heure_fin: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacite">Capacité (couverts)</Label>
        <Input
          id="capacite"
          type="number"
          min={1}
          value={valeur.capacite}
          onChange={(e) => setValeur({ ...valeur, capacite: parseInt(e.target.value, 10) || 0 })}
          required
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-bordeaux/20 p-3">
        <Label className="text-sm">
          {valeur.actif ? "Actif" : "Inactif"}
        </Label>
        <Switch
          checked={valeur.actif}
          onCheckedChange={(actif) => setValeur({ ...valeur, actif })}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="max-w-2xl font-montserrat text-sm text-bordeaux/70">
          Un modèle décrit un service récurrent. La génération mensuelle (onglet
          Calendrier) crée les créneaux réels à partir des modèles actifs.
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau modèle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau modèle</DialogTitle>
              <DialogDescription>
                Un service récurrent du brunch (samedi ou dimanche)
              </DialogDescription>
            </DialogHeader>
            {champsFormulaire(creation, setCreation)}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                {isLoading ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {groupes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-bordeaux/70">Aucun modèle pour le moment</p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer votre premier modèle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {groupes.map(({ jour, items }) => (
            <Card key={jour}>
              <CardHeader className="rounded-t-lg bg-[#FBFAF0]">
                <CardTitle className="font-playfair text-xl text-bordeaux">
                  {JOURS[jour]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {items.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-bordeaux/10 p-3"
                  >
                    <div>
                      <p className="font-playfair text-base text-bordeaux">
                        {m.heure_debut.slice(0, 5)} – {m.heure_fin.slice(0, 5)}
                      </p>
                      <p className="text-sm text-bordeaux/60">
                        {m.capacite} couverts
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-bordeaux/70">
                          {m.actif ? "Actif" : "Inactif"}
                        </span>
                        <Switch
                          checked={m.actif}
                          onCheckedChange={(actif) => handleToggle(m, actif)}
                        />
                      </div>
                      <Button variant="outline" size="icon" onClick={() => ouvrirEdition(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(m)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edition */}
      <Dialog open={!!editModele} onOpenChange={() => setEditModele(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le modèle</DialogTitle>
          </DialogHeader>
          {champsFormulaire(edition, setEdition)}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditModele(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suppression */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le modèle</DialogTitle>
            <DialogDescription>
              Les créneaux déjà générés à partir de ce modèle resteront
              réservables ; seul le modèle disparaît.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
