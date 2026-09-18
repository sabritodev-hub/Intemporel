import type { Metadata } from "next";
import { config } from "@/lib/config";
import { afficher } from "@/lib/reservation/telephone";
import LegalLayout, { Section, Liste, Encart } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Conditions de réservation",
};

export default async function CguPage() {
  const cfg = await config();
  const emailContact = cfg.email_contact || "";
  const telephoneAffiche = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;
  const retention = cfg.retention_table_min || "20";

  return (
    <LegalLayout
      surTitre="L'Intemporel"
      titre="Conditions de réservation"
      chapeau="Les règles qui encadrent la réservation en ligne du brunch."
      derniereMaj="18 septembre 2026"
      emailContact={emailContact}
      telephoneAffiche={telephoneAffiche}
    >
      <Section numero="01" titre="Objet du site">
        <p>
          Ce site présente la carte de L'Intemporel et permet de réserver une
          table pour le brunch du samedi ou du dimanche. Il ne propose ni
          commande à distance, ni paiement en ligne, ni livraison. Les prix et
          la composition des plats sont indicatifs : seule la carte remise en
          salle fait foi.
        </p>
      </Section>

      <Section numero="02" titre="Réserver une table">
        <p>
          La réservation est <strong>gratuite</strong>, sans acompte ni
          empreinte bancaire. Elle est ouverte le samedi et le dimanche, sur
          les créneaux affichés, pour 1 à 12 personnes en ligne — au-delà,
          par téléphone.
        </p>
        <p>
          Les réservations d'une journée ferment à l'heure du premier service
          de cette journée. Votre réservation n'est considérée comme valide
          qu'après réception de l'email de confirmation : si vous ne le
          recevez pas, vérifiez vos indésirables puis appelez-nous.
        </p>
      </Section>

      <Section numero="03" titre="Retard et table non occupée">
        <p>
          Votre table est gardée <strong>{retention} minutes</strong> après
          l'heure du créneau réservé. Passé ce délai, elle peut être
          réattribuée — nous faisons cependant notre possible pour vous
          accueillir si vous nous prévenez par téléphone.
        </p>
      </Section>

      <Section numero="04" titre="Annuler">
        <p>
          L'annulation se fait uniquement depuis le lien reçu dans votre email
          de confirmation, jusqu'à 24 h avant le service. Il n'existe pas de
          compte client : ce lien est le seul accès à votre réservation.
          Moins de 24 h avant, l'annulation se fait par téléphone.
        </p>
        <Encart>
          Le restaurant peut, exceptionnellement, annuler un service (incident
          en cuisine, fermeture imprévue). Vous êtes alors prévenu par email,
          avec le motif de l'annulation.
        </Encart>
      </Section>

      <Section numero="05" titre="Usage loyal">
        <p>
          Les réservations multiples, fictives ou avec de fausses coordonnées
          privent le restaurant de couverts réels et peuvent être annulées
          sans préavis. Le formulaire de réservation est protégé contre les
          envois automatisés.
        </p>
      </Section>

      <Section numero="06" titre="Disponibilité et responsabilité">
        <p>
          Le site peut être temporairement indisponible pour maintenance ; le
          téléphone reste alors ouvert pour réserver. Les textes et
          photographies du site sont la propriété de L'Intemporel ou de leurs
          auteurs respectifs.
        </p>
      </Section>

      <Section numero="07" titre="Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de
          litige, une solution amiable sera recherchée avant toute action
          judiciaire.
        </p>
        <Liste
          items={[
            "Consultez notre politique de confidentialité pour le détail du traitement de vos données.",
          ]}
        />
      </Section>
    </LegalLayout>
  );
}
