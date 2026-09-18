import { cn } from "@/lib/utils";
import type { Etat } from "@/lib/reservation/etats";

const COULEUR_REMPLISSAGE: Record<Etat, string> = {
  dispo: "bg-dispo",
  presque: "bg-presque",
  complet: "bg-complet",
  ferme: "bg-ferme",
};

interface JaugeRemplissageProps {
  occupees: number;
  capacite: number;
  etat: Etat;
  hauteur?: number; // px, 6 à 9 selon le contexte
  texte?: string;
  className?: string;
}

/**
 * Un seul endroit décide de l'apparence de la jauge, utilisé à l'identique
 * côté public (écran 3) et côté admin (écrans 7, 9, 11).
 */
export default function JaugeRemplissage({
  occupees,
  capacite,
  etat,
  hauteur = 8,
  texte,
  className,
}: JaugeRemplissageProps) {
  const pourcentage = capacite > 0 ? Math.min((occupees / capacite) * 100, 100) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className="w-full overflow-hidden rounded-full bg-beige-darker"
        style={{ height: hauteur }}
      >
        <div
          className={cn("h-full rounded-full transition-all", COULEUR_REMPLISSAGE[etat])}
          style={{ width: `${pourcentage}%` }}
        />
      </div>
      <p className="font-montserrat text-xs text-bordeaux/70">
        {texte ?? `${occupees} couverts réservés sur ${capacite}`}
      </p>
    </div>
  );
}
