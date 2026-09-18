export const MESSAGES: Record<string, string> = {
  COMPLET: "Ce créneau vient d'être complété. Choisissez un autre horaire.",
  CRENEAU_INDISPONIBLE: "Ce créneau n'est plus proposé à la réservation.",
  RESERVATIONS_CLOSES:
    "Les réservations de cette journée sont closes : le premier service a commencé.",
  HORS_PERIODE: "Les réservations ouvrent le mois précédant le service.",
  COUVERTS_INVALIDE:
    "Pour un groupe de plus de 12 personnes, contactez-nous par téléphone.",
  CHAMPS_MANQUANTS: "Merci de compléter tous les champs.",
  TOKEN_INVALIDE: "Ce lien n'est plus valable.",
  DEJA_ANNULEE: "Cette réservation a déjà été annulée.",
  DELAI_DEPASSE:
    "Votre service commence dans moins de 24 h : appelez-nous, nous nous en occupons.",
  NON_AUTORISE: "Action réservée à l'administration.",
  MOTIF_REQUIS:
    "Indiquez le motif : il sera repris dans l'email envoyé aux clients.",
};

export function messageErreur(e: unknown): string {
  const brut = (e as { message?: string })?.message ?? "";
  const code = brut.split(":")[0].trim();
  if (code === "CAPACITE_TROP_BASSE") {
    const n = brut.split(":")[1]?.trim();
    return `${n} couverts déjà réservés : la capacité ne peut pas descendre sous ${n}.`;
  }
  return MESSAGES[code] ?? "Une erreur est survenue. Réessayez ou appelez-nous.";
}
