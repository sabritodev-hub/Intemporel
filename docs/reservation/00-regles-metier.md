# 00 — Règles métier

Ces règles sont **non négociables**. Si une maquette, un commentaire ou une autre page de ce dossier semble les contredire, c'est ce fichier qui fait foi.

---

## 1. Ce qui est réservable

Le brunch, le **samedi et le dimanche** uniquement, sur les créneaux définis par les modèles actifs. Rien d'autre n'est réservable aujourd'hui.

Un jour peut porter **plusieurs services** aux horaires et capacités différents (par exemple 10h00–12h00 à 30 couverts puis 12h30–14h30 à 24 couverts). Le samedi et le dimanche n'ont pas forcément les mêmes services : chaque jour a ses propres modèles.

## 2. Taille du groupe

De **1 à 12 personnes** par réservation en ligne. Au-delà de 12, pas de formulaire : un encart renvoie vers le téléphone du restaurant.

La saisie manuelle en admin n'est pas limitée à 12 (le personnel prend aussi les groupes au téléphone), mais reste plafonnée à 50 pour éviter les fautes de frappe.

## 3. Clôture des réservations — la règle la plus souvent mal comprise

> Les réservations d'une journée ferment à l'heure de début du **premier service de cette journée**.

Ce n'est ni 24 h avant, ni minuit, ni l'heure du service concerné.

**Exemple.** Le dimanche 20 septembre comporte deux services : 10h00 et 12h30. À 10h00 pile, **les deux** services de ce dimanche cessent d'être réservables — y compris celui de 12h30 qui n'a pas encore commencé.

Raison : la cuisine cale ses quantités sur le total de la journée au moment où le service démarre.

Cette règle est implémentée **dans la fonction Postgres `reserver()`**, pas seulement dans l'affichage. Un client qui garde son onglet ouvert et clique après l'heure doit recevoir l'erreur `RESERVATIONS_CLOSES`.

## 4. Période réservable

Le **mois en cours et le mois suivant**, en fuseau `Europe/Paris`.

Le 30 septembre, un client peut réserver jusqu'au 31 octobre. Le 1er octobre, jusqu'au 30 novembre. La navigation du calendrier est bornée à cette fenêtre : pas de flèche vers un mois hors période, pas de flèche vers un mois sans créneau généré.

## 5. Validation

**Automatique.** Une réservation est `confirmee` dès que `reserver()` a vérifié qu'il restait assez de places. Il n'y a pas de statut « en attente » ni de validation manuelle.

La réservation n'est cependant considérée comme valide **côté client** qu'après réception de l'email de confirmation — c'est ce que disent les CGU, et c'est ce qui justifie le message « vérifiez vos indésirables puis appelez-nous ».

## 6. Annulation par le client

- **Uniquement** depuis le lien reçu par email. Il n'y a pas de compte client : le jeton est le seul accès à une réservation.
- Possible **jusqu'à 24 h avant** le début du service.
- **Moins de 24 h avant : l'annulation en ligne est fermée.** La page affiche le numéro du restaurant en grand, en lien `tel:`, et invite à appeler.
- Aucun lien vers `/reservation/annuler` depuis le site. Cette route n'est atteignable que par l'email.

## 7. Annulation par le restaurant

L'admin peut annuler un créneau entier (fermeture imprévue, incident en cuisine) en saisissant un **motif**, qui est repris tel quel dans l'email envoyé aux clients.

L'email ne suffit pas quand le service est proche : après l'annulation, l'admin obtient la **liste des clients à appeler** avec leurs numéros en lien `tel:` et une case à cocher pour suivre ses appels.

## 8. Capacité

La capacité d'un créneau **ne peut jamais descendre sous le nombre de couverts déjà réservés**. Si 18 couverts sont réservés, la capacité ne peut pas passer sous 18 : message explicite, pas un échec silencieux.

Un dépassement volontaire reste possible depuis l'admin lors d'un ajout manuel, après confirmation explicite (le personnel sait parfois qu'il peut ajouter une table).

## 9. Données personnelles

Collectées : **nom, email, téléphone, nombre de personnes**. Rien d'autre.

- Pas de champ « allergies » : ce sont des données de santé au sens du RGPD, donc bien plus contraignantes. Un message invite à les signaler à l'arrivée.
- Le téléphone est **obligatoire** : c'est le seul moyen de joindre un client en cas d'annulation de dernière minute.
- Nom, email et téléphone sont **effacés automatiquement 30 jours** après la fin du créneau. Le reste (nombre de couverts, statut) est conservé de façon anonyme pour les statistiques de fréquentation.
- Consentement recueilli par une case **non pré-cochée**.

## 10. Statuts

**Créneau** — `ouvert` · `ferme` (plus de nouvelles réservations, les existantes tiennent) · `annule` (le service n'a pas lieu).

**Réservation** — `confirmee` · `venue` · `absent` · `annulee_client` · `annulee_restaurant`.

## 11. Fuseau horaire

Tout est stocké en `timestamptz`. Tout est affiché en `Europe/Paris`. Les changements d'heure de fin mars et fin octobre sont gérés par `at time zone`, jamais par un décalage codé en dur.

---

## Récapitulatif en une table

| Règle | Valeur |
|---|---|
| Jours | Samedi et dimanche (par les modèles actifs) |
| Services par jour | Variables, plusieurs possibles |
| Groupe en ligne | 1 à 12 personnes |
| Groupe en admin | 1 à 50 personnes |
| Période | Mois en cours + mois suivant, Europe/Paris |
| Clôture | Heure du premier service de la journée |
| Validation | Automatique si places disponibles |
| Annulation client | Lien email, jusqu'à 24 h avant |
| Annulation < 24 h | Par téléphone uniquement |
| Purge des coordonnées | 30 jours après la fin du créneau |
| Rétention de table | 20 minutes après l'heure du créneau |

## 12. Tout ce qui varie est paramétrable

Aucune de ces valeurs n'est écrite en dur dans le code :

| Réglage | Où l'admin le change |
|---|---|
| Téléphone, adresse, email de contact | `/admin/settings` |
| Durée de rétention de table | `/admin/settings` |
| Ouverture des réservations en ligne | `/admin/settings` |
| Horaires et capacité de chaque service | `/admin/creneaux`, onglet Modèles |

Le restaurant doit pouvoir changer un horaire, une capacité ou un numéro de téléphone **sans redéploiement et sans développeur**.
