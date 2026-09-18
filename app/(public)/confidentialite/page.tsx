import type { Metadata } from "next";
import { config } from "@/lib/config";
import { afficher } from "@/lib/reservation/telephone";
import LegalLayout, { Section, Tableau, Liste, Encart } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default async function ConfidentialitePage() {
  const cfg = await config();
  const adresse = cfg.adresse_restaurant || "";
  const emailContact = cfg.email_contact || "";
  const telephoneAffiche = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;

  return (
    <LegalLayout
      surTitre="L'Intemporel"
      titre="Politique de confidentialité"
      chapeau="Comment nous traitons vos informations lorsque vous réservez une table pour le brunch."
      derniereMaj="18 septembre 2026"
      emailContact={emailContact}
      telephoneAffiche={telephoneAffiche}
    >
      <Section numero="01" titre="Qui est responsable de vos données">
        <p>
          Le restaurant L'Intemporel est responsable du traitement des données
          collectées lors de votre réservation. Aucune donnée n'est transmise à
          un tiers à des fins commerciales.
        </p>
        <Tableau
          lignes={[
            { cle: "Adresse", valeur: adresse || "Non renseignée" },
            { cle: "Email", valeur: emailContact || "Non renseigné" },
            { cle: "Téléphone", valeur: telephoneAffiche ?? "Non renseigné" },
          ]}
        />
      </Section>

      <Section numero="02" titre="Ce que nous collectons, et pourquoi">
        <Tableau
          lignes={[
            { cle: "Nom", valeur: "Retrouver votre table à l'arrivée et vous accueillir par votre nom" },
            {
              cle: "Email",
              valeur: "Confirmation, lien d'annulation, information en cas d'annulation du service",
            },
            {
              cle: "Téléphone",
              valeur: "Vous joindre en cas d'imprévu le jour même. Jamais de prospection",
            },
            {
              cle: "Personnes, date, créneau",
              valeur: "Organiser la salle et respecter la capacité de chaque service",
            },
          ]}
        />
        <Encart>
          <strong>Base légale</strong> : l'exécution de votre demande de
          réservation (article 6.1.b du RGPD). Sans ces informations, nous ne
          pouvons pas tenir la table.
        </Encart>
      </Section>

      <Section numero="03" titre="Combien de temps nous les gardons">
        <p>
          Votre nom, votre email et votre téléphone sont effacés
          automatiquement <strong>30 jours</strong> après la fin du créneau
          réservé (ou après son annulation), sans démarche de votre part.
        </p>
        <p>
          Au-delà, seul subsiste un décompte anonyme du nombre de couverts par
          service, qui ne permet d'identifier personne et sert uniquement à nos
          statistiques de fréquentation.
        </p>
      </Section>

      <Section numero="04" titre="Qui y a accès">
        <p>
          Le responsable de l'établissement et l'équipe de salle en service,
          depuis un espace protégé par mot de passe. Trois prestataires
          techniques interviennent :
        </p>
        <Liste
          items={[
            <>
              <strong>Supabase</strong> — hébergement et base de données,
              stockées dans l'Union européenne
            </>,
            <>
              <strong>Notre prestataire d'emailing</strong> — envoi des emails
              de confirmation et d'annulation, traite uniquement l'adresse et
              le contenu du message
            </>,
            <>
              <strong>Cloudflare Turnstile</strong> — protection anti-robot du
              formulaire, analyse le comportement du navigateur sans profiler
              ni suivre la navigation
            </>,
          ]}
        />
      </Section>

      <Section numero="05" titre="Vos droits">
        <p>
          Vous disposez d'un droit d'accès, de rectification, de suppression,
          d'opposition et de retrait du consentement sur vos données. Nous
          répondons sous 30 jours à toute demande envoyée par email ou par
          téléphone.
        </p>
        <p>
          Le lien reçu dans votre email de confirmation vous permet aussi de
          supprimer vous-même votre réservation jusqu'à 24 h avant le service.
        </p>
        <Encart>
          Vous pouvez introduire une réclamation auprès de la <strong>CNIL</strong>
          , 3 place de Fontenoy, 75007 Paris — cnil.fr
        </Encart>
      </Section>

      <Section numero="06" titre="Cookies">
        <p>
          Ce site n'utilise que des cookies strictement nécessaires à la
          réservation. Le détail et vos préférences sont accessibles depuis le
          lien « Gérer les cookies » en pied de page.
        </p>
      </Section>
    </LegalLayout>
  );
}
