"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const CLE = "intemporel_cookies_prefs";

interface Prefs {
  preferences: boolean;
  audience: boolean;
}

const PREFS_VIDES: Prefs = { preferences: false, audience: false };

function lireStock(): Prefs {
  if (typeof window === "undefined") return PREFS_VIDES;
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return PREFS_VIDES;
    const parsed = JSON.parse(brut);
    return parsed?.prefs ?? PREFS_VIDES;
  } catch {
    return PREFS_VIDES;
  }
}

/**
 * S'ouvre en réponse à l'évènement "ouvrir-panneau-cookies", déclenché par
 * le bouton "Gérer les cookies" du pied de page.
 */
export default function PanneauCookies() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(PREFS_VIDES);

  useEffect(() => {
    setPrefs(lireStock());
    const ouvrir = () => {
      setPrefs(lireStock());
      setOpen(true);
    };
    window.addEventListener("ouvrir-panneau-cookies", ouvrir);
    return () => window.removeEventListener("ouvrir-panneau-cookies", ouvrir);
  }, []);

  const enregistrer = () => {
    try {
      localStorage.setItem(CLE, JSON.stringify({ prefs, date: Date.now() }));
    } catch {
      // localStorage indisponible (navigation privée) : rien de bloquant.
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gérer les cookies</DialogTitle>
          <DialogDescription>
            Ce site ne dépose que les cookies nécessaires à la réservation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-bordeaux/10 p-3">
            <div className="pr-4">
              <p className="font-montserrat text-sm font-semibold text-bordeaux">
                Strictement nécessaires
              </p>
              <p className="text-xs text-bordeaux/60">
                Session de réservation, Cloudflare Turnstile — durée : la visite
              </p>
            </div>
            <Switch checked disabled className="cursor-not-allowed opacity-60" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-bordeaux/10 p-3">
            <div className="pr-4">
              <p className="font-montserrat text-sm font-semibold text-bordeaux">
                Préférences d'affichage
              </p>
              <p className="text-xs text-bordeaux/60">
                Ex. dernière catégorie consultée — 6 mois
              </p>
            </div>
            <Switch
              checked={prefs.preferences}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, preferences: v }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-bordeaux/10 p-3">
            <div className="pr-4">
              <p className="font-montserrat text-sm font-semibold text-bordeaux">
                Mesure d'audience
              </p>
              <p className="text-xs text-bordeaux/60">
                Statistiques agrégées, anonymes — 13 mois
              </p>
            </div>
            <Switch
              checked={prefs.audience}
              onCheckedChange={(v) => setPrefs((p) => ({ ...p, audience: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={enregistrer}>Enregistrer mes préférences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
