import { jourLong, heure } from "@/lib/reservation/dates";
import EmailLayout from "./Layout";

interface AnnulationRestaurantProps {
  nom: string;
  debut: Date;
  couverts: number;
  motif: string;
  siteUrl: string;
  adresse: string;
  telephoneAffiche: string | null;
}

/** Envoyé quand l'admin annule un créneau entier (écran 10 du back-office). */
export default function AnnulationRestaurant({
  nom,
  debut,
  couverts,
  motif,
  siteUrl,
  adresse,
  telephoneAffiche,
}: AnnulationRestaurantProps) {
  return (
    <EmailLayout
      apercu={`Nous devons annuler votre brunch du ${jourLong(debut)}`}
      titre="Nous sommes désolés"
      intro={`Bonjour ${nom}, nous devons malheureusement annuler le service que vous aviez réservé. Toutes nos excuses pour ce contretemps.`}
      motif={motif}
      lignes={[
        { label: "Date annulée", valeur: jourLong(debut) },
        { label: "Heure", valeur: heure(debut) },
        { label: "Personnes", valeur: String(couverts) },
      ]}
      bouton={{ texte: "Choisir un autre créneau", href: `${siteUrl}/reservation` }}
      rappel={
        telephoneAffiche
          ? `Une question ? Appelez-nous au ${telephoneAffiche}, nous trouverons une solution.`
          : "Une question ? Contactez-nous, nous trouverons une solution."
      }
      adresse={adresse}
      telephoneAffiche={telephoneAffiche}
    />
  );
}
