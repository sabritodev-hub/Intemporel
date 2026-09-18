import { jourLong, heure } from "@/lib/reservation/dates";
import EmailLayout from "./Layout";

interface AnnulationClientProps {
  nom: string;
  debut: Date;
  couverts: number;
  siteUrl: string;
  adresse: string;
  telephoneAffiche: string | null;
}

/** Envoyé quand le client annule lui-même depuis son lien. */
export default function AnnulationClient({
  nom,
  debut,
  couverts,
  siteUrl,
  adresse,
  telephoneAffiche,
}: AnnulationClientProps) {
  return (
    <EmailLayout
      apercu={`Votre réservation du ${jourLong(debut)} est annulée`}
      titre="Annulation confirmée"
      intro={`Bonjour ${nom}, votre réservation a bien été annulée. Nous espérons vous accueillir prochainement.`}
      lignes={[
        { label: "Date annulée", valeur: jourLong(debut) },
        { label: "Heure", valeur: heure(debut) },
        { label: "Personnes", valeur: String(couverts) },
      ]}
      bouton={{ texte: "Réserver un nouveau créneau", href: `${siteUrl}/reservation` }}
      rappel="Aucune démarche supplémentaire de votre part."
      adresse={adresse}
      telephoneAffiche={telephoneAffiche}
    />
  );
}
