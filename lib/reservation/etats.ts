export type Etat = "dispo" | "presque" | "complet" | "ferme";

export function etatCreneau(c: {
  places_restantes: number;
  capacite: number;
  statut: string;
  reservable: boolean;
  journee_close: boolean;
}): Etat {
  if (c.statut !== "ouvert" || c.journee_close) return "ferme";
  if (c.places_restantes <= 0) return "complet";
  if (c.places_restantes / c.capacite < 0.2) return "presque"; // seuil : 20 %
  return "dispo";
}

export const LIBELLE_ETAT: Record<Etat, string> = {
  dispo: "Disponible",
  presque: "Presque complet",
  complet: "Complet",
  ferme: "Fermé",
};

const RANG_ETAT: Record<Etat, number> = { dispo: 0, presque: 1, complet: 2, ferme: 3 };

/** L'état d'une journée est le meilleur état de ses créneaux. */
export function meilleurEtatJour(etats: Etat[]): Etat {
  if (etats.length === 0) return "ferme";
  return etats.reduce((meilleur, e) => (RANG_ETAT[e] < RANG_ETAT[meilleur] ? e : meilleur));
}
