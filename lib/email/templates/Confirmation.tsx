import { jourLong, heure } from "@/lib/reservation/dates";
import EmailLayout from "./Layout";

interface ConfirmationProps {
  nom: string;
  debut: Date;
  fin: Date;
  couverts: number;
  reference: string;
  token: string;
  siteUrl: string;
  adresse: string;
  telephoneAffiche: string | null;
}

export default function Confirmation({
  nom,
  debut,
  couverts,
  reference,
  token,
  siteUrl,
  adresse,
  telephoneAffiche,
}: ConfirmationProps) {
  return (
    <EmailLayout
      apercu={`Votre brunch du ${jourLong(debut)} est confirmé`}
      titre="Votre table est réservée"
      intro={`Bonjour ${nom}, nous vous attendons pour le brunch. Voici le récapitulatif de votre réservation.`}
      lignes={[
        { label: "Date", valeur: jourLong(debut) },
        { label: "Heure", valeur: heure(debut) },
        { label: "Personnes", valeur: String(couverts) },
        { label: "Au nom de", valeur: nom },
        { label: "Référence", valeur: reference },
      ]}
      bouton={{
        texte: "Annuler ma réservation",
        href: `${siteUrl}/reservation/annuler?token=${token}`,
      }}
      rappel={
        telephoneAffiche
          ? `Annulation en ligne possible jusqu'à 24 h avant. Ensuite, appelez le ${telephoneAffiche}.`
          : "Annulation en ligne possible jusqu'à 24 h avant."
      }
      adresse={adresse}
      telephoneAffiche={telephoneAffiche}
    />
  );
}
