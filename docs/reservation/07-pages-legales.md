# 07 — Pages légales, cookies, 404 et 500

Maquettes : `maquettes/Pages légales.dc.html` (version complète, onglets cliquables) et `maquettes/Réservation Brunch.dc.html` écrans 13 à 16 (version courte).

> **Version retenue : `Pages légales.dc.html`**, la plus complète (6 sections de confidentialité, 7 de CGU) et la seule des deux à être une vraie page responsive — les écrans 13-16 de l'autre fichier sont des planches de présentation à largeur fixe. On y reprend aussi le texte de la 404 (« Cette page a quitté la carte »).
>
> Une seule chose est reprise de l'autre fichier : **l'écran 500**, qui n'existe que là.
>
> Rétention de table : **20 minutes** (valeur tranchée par le client, lue depuis `site_config.retention_table_min`). Attention : le texte des CGU dans `Pages légales.dc.html` dit encore « 15 minutes ». Ne pas le recopier tel quel — la durée est injectée depuis les paramètres.

> Ces textes sont rédigés au plus près du cas réel mais **ne constituent pas un conseil juridique**. Une relecture par un professionnel est recommandée avant publication.

---

## Mise en page commune

Largeur de lecture **860 px**, en-tête de site standard, barre d'onglets en défilement horizontal sur fond `beige-darker`.

Structure d'un document : sur-titre en majuscules espacées · titre en Playfair `clamp(32px, 7.5vw, 48px)` · chapeau 15 px en `#7d4152` · date de dernière mise à jour · puis les sections, chacune numérotée (`01`, `02`… en Montserrat 12 px `#A0223B`, aligné sur la ligne de base du titre).

Corps de texte : 14 px, `line-height: 1.75`, couleur `#6b2135`.

Trois blocs réutilisables : le **tableau** clé/valeur (carte blanche, lignes séparées par `#f0ead4`), la **liste** à puces, et l'**encart** sur fond `beige-darker` pour les mentions importantes (base légale, recours CNIL).

En bas de chaque document : carte « Une question sur vos données ? » avec deux boutons — « Nous écrire » (primaire, `mailto:`) et le téléphone (secondaire, `tel:`).

---

## `/confidentialite`

Liée depuis la case de consentement du formulaire et le pied de chaque email. Six sections :

**01 · Qui est responsable de vos données** — raison sociale, adresse, email, téléphone. Le restaurant est seul responsable du traitement ; aucune donnée transmise à un tiers à des fins commerciales.

**02 · Ce que nous collectons, et pourquoi** — tableau à quatre lignes, la finalité de chaque champ :

| Champ | Finalité |
|---|---|
| Nom | Retrouver votre table à l'arrivée et vous accueillir par votre nom |
| Email | Confirmation, lien d'annulation, information en cas d'annulation du service |
| Téléphone | Vous joindre en cas d'imprévu le jour même. Jamais de prospection |
| Nombre de personnes, date, créneau | Organiser la salle et respecter la capacité de chaque service |

Encart : « **Base légale** : l'exécution de votre demande de réservation (article 6.1.b du RGPD). Sans ces informations, nous ne pouvons pas tenir la table. »

**03 · Combien de temps nous les gardons** — effacement automatique **30 jours** après la venue ou l'annulation, sans démarche du client. Au-delà, seul subsiste un décompte anonyme de couverts par service, qui ne permet pas d'identifier quiconque. Cette phrase décrit exactement ce que fait le job `anonymiser-reservations` : ne pas la modifier sans modifier le job.

**04 · Qui y a accès** — le responsable et l'équipe de salle en service, depuis un espace protégé par mot de passe. Puis la liste des sous-traitants :

- Hébergement et base de données : **Supabase**, données stockées dans l'Union européenne
- Envoi des emails : le prestataire d'emailing, qui traite uniquement l'adresse et le contenu du message
- Protection anti-robot : **Cloudflare Turnstile**, qui analyse le comportement du navigateur **sans profiler ni suivre la navigation**

**05 · Vos droits** — accès, rectification, suppression, opposition, retrait du consentement ; réponse sous 30 jours. Le lien d'annulation permet aussi de supprimer soi-même sa réservation jusqu'à 24 h avant. Encart : recours **CNIL**, 3 place de Fontenoy, 75007 Paris, cnil.fr.

**06 · Cookies** — renvoi vers le réglage des préférences.

---

## `/cgu`

Sept sections, calées sur les règles réelles du module (`00-regles-metier.md`) :

1. **Objet du site** — présentation de la carte et réservation du brunch. Ni commande à distance, ni paiement en ligne, ni livraison. Prix et composition indicatifs, seule la carte remise en salle fait foi.
2. **Réserver une table** — gratuit, sans acompte ni empreinte bancaire. Samedi et dimanche sur les créneaux affichés · 1 à 12 personnes en ligne, au-delà par téléphone · clôture à l'heure du premier service de la journée · **réservation confirmée uniquement après réception de l'email** (« sans cet email, vérifiez vos indésirables puis appelez-nous »).
3. **Retard et table non occupée** — table gardée **20 minutes** après l'heure du créneau. La valeur est lue depuis `site_config.retention_table_min` et injectée dans la phrase : si le restaurant la change dans ses paramètres, les CGU suivent automatiquement. Passé ce délai la table peut être réattribuée, mais le restaurant fait son possible si le client prévient par téléphone.
4. **Annuler** — uniquement depuis le lien de l'email, jusqu'à 24 h avant. Il n'existe pas de compte client : ce lien est le seul accès. Moins de 24 h : par téléphone. Encart : le restaurant peut exceptionnellement annuler un service, le client est alors prévenu par email avec le motif.
5. **Usage loyal** — les réservations multiples ou fictives et les fausses coordonnées privent le restaurant de couverts réels ; elles peuvent être annulées. Le formulaire est protégé contre les envois automatisés.
6. **Disponibilité et responsabilité** — indisponibilité possible pour maintenance, le téléphone reste ouvert. Propriété intellectuelle des textes et photographies.
7. **Droit applicable** — droit français, solution amiable recherchée avant toute action.

---

## Cookies

Deux modes maquettés. **Le choix dépend de ce que le site dépose réellement**, pas d'une préférence esthétique.

### Mode `information` — recommandé en l'état

Tel que spécifié, le site ne pose que des cookies **strictement nécessaires** : session de réservation et jeton Turnstile. Ces cookies sont **exemptés de consentement**. Un bandeau à trois boutons serait alors une friction inutile et juridiquement injustifiée.

Une simple mention suffit : « Ce site n'utilise que les cookies nécessaires à la réservation. [En savoir plus]. » avec un bouton « J'ai compris ».

### Mode `consentement` — dès qu'une mesure d'audience est ajoutée

Obligatoire dès l'installation d'un outil de statistiques ou de cookies de confort. Trois boutons de **poids visuel égal** : Tout accepter · Tout refuser · Personnaliser.

L'exigence CNIL est explicite : **refuser doit être aussi simple qu'accepter**. Un bouton « Continuer sans accepter » discret à côté d'un « Tout accepter » coloré est non conforme.

### Panneau de préférences

Dans les deux modes, trois catégories détaillées avec durée et finalité :

| Catégorie | Contenu | Interrupteur |
|---|---|---|
| Strictement nécessaires | Session de réservation, Cloudflare Turnstile — durée : la visite | **Verrouillé** (`#b79aa2`, `cursor: not-allowed`) |
| Préférences d'affichage | Stockage local, ex. dernière catégorie consultée — 6 mois | Libre |
| Mesure d'audience | Statistiques agrégées, anonymes — 13 mois | Libre |

Choix persisté 6 mois. Le lien **« Gérer les cookies »** du pied de page rouvre le panneau : c'est obligatoire pour permettre le retrait du consentement.

---

## 404 · `app/not-found.tsx`

Traitement éditorial, pas technique : « 404 » en Playfair très grand, filet, titre, deux sorties utiles (Voir la carte / Réserver le brunch).

Et surtout, la mention spécifique à ce module, en bas :

> Vous cherchiez à annuler une réservation ? Le lien d'annulation se trouve uniquement dans votre email de confirmation. Sinon, appelez-nous au …

C'est le motif d'erreur le plus probable : un client qui bricole l'URL d'annulation ou dont le lien a été tronqué par son client de messagerie.

---

## 500 · `app/error.tsx`

Même habillage que la 404, avec un message critique :

> **Si vous étiez en train de réserver, votre réservation n'a pas été enregistrée.** Réessayez, ou appelez-nous.

Cette phrase évite un double service : sans elle, un client qui voit une erreur ne sait pas s'il doit recommencer, et le restaurant se retrouve avec deux tables pour la même personne.

Ne jamais afficher de trace technique : `console.error` côté serveur, message humain côté client.

---

## Pied de page

Une seule rangée à ajouter à `components/layout/Footer.tsx`, sous la baseline existante :

**Mentions légales · Confidentialité · CGU · Gérer les cookies**

« Gérer les cookies » est un `<button>` qui rouvre le panneau, pas un lien.

---

## Mentions légales

La page `/mentions-legales` reste à écrire : elle demande la **raison sociale, le SIRET, le numéro de TVA et le nom de l'hébergeur**, informations que seul le client possède. Voir `10-decisions-ouvertes.md`.
