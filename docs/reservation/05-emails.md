# 05 — Emails transactionnels

Maquettes : `maquettes/Réservation Brunch.dc.html`, section « Emails », écran 12.

Trois emails, **un seul destinataire par envoi**. Jamais de liste en copie : Resend compte chaque destinataire (To, Cc, Bcc) séparément dans le quota, et une adresse en copie visible serait une fuite de données personnelles.

---

## Fournisseur

**Resend**, offre gratuite : 3 000 emails par mois, plafonnés à **100 par jour**, un domaine vérifié, 30 jours de rétention des logs. Largement suffisant pour un brunch de weekend.

Deux points à connaître :

- **Le plafond quotidien est le vrai plafond.** 3 000 par mois font exactement 100 par jour en moyenne : il n'y a pas de marge. Une annulation de service un samedi matin peut envoyer 30 emails d'un coup ; ça passe, mais il faut le savoir.
- **Les logs sont aux États-Unis.** L'envoi peut partir d'Irlande, mais les données du compte et les logs restent américains. À mentionner dans la politique de confidentialité, comme le fait déjà la maquette (« notre prestataire d'emailing »).

**Aucun email n'est envoyé à l'administrateur.** Le responsable consulte les réservations dans le back-office. Une notification par réservation doublerait la consommation du quota pour rien.

---

## Transport

Deux transports derrière une même fonction, choisis par `EMAIL_TRANSPORT` :

```ts
// lib/email/envoyer.ts
import "server-only";

export async function envoyer(opts: {
  to: string; subject: string; react: React.ReactElement;
}) {
  if (process.env.EMAIL_TRANSPORT === "resend") {
    const { Resend } = await import("resend");
    return new Resend(process.env.RESEND_API_KEY!).emails.send({
      from: process.env.EMAIL_FROM!,
      replyTo: await config("email_contact"),
      ...opts,
    });
  }
  // dev : Mailpit (SMTP local, rien ne sort)
  const nodemailer = await import("nodemailer");
  const { render } = await import("@react-email/components");
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: false,
  });
  return t.sendMail({
    from: process.env.EMAIL_FROM!, to: opts.to, subject: opts.subject,
    html: await render(opts.react),
  });
}
```

**Mailpit** se déploie en un conteneur sur le Coolify existant : il capture tout et offre une interface web pour relire les emails. Tant que le nom de domaine n'est pas configuré, c'est le seul transport à utiliser — envoyer depuis un domaine non vérifié dégrade durablement la réputation d'expédition.

### Quand le domaine sera prêt

1. Ajouter le domaine dans Resend.
2. Créer les enregistrements DNS **SPF**, **DKIM** et **DMARC** fournis par Resend.
3. Attendre la vérification, puis basculer `EMAIL_TRANSPORT=resend`.

Sans ces trois enregistrements, les emails partent en indésirables. Ce n'est pas optionnel.

---

## Gabarit commun

Largeur **600 px**, tables HTML, styles **inline**, aucune feuille de style externe. React Email produit cela correctement, mais il faut rester sur ses composants (`Section`, `Row`, `Column`) plutôt que sur des `div` en flex, que les clients de messagerie rendent mal.

Structure de haut en bas :

1. **En-tête bordeaux** — sur-titre « L'INTEMPOREL » en majuscules espacées, puis le titre en Playfair 24 px.
2. **Corps beige `#F5F5DC`** — phrase d'accroche nominative, puis un bloc blanc encadré `#d9d4b4` avec les lignes du récapitulatif (libellé à gauche en `#7d4152`, valeur à droite en gras).
3. **Bouton d'action** bordeaux pleine largeur, texte beige, rayon 10 px.
4. **Ligne de rappel** centrée, 11,5 px.
5. **Pied** séparé par un filet : adresse, téléphone en `tel:`, et « Vos coordonnées sont effacées 30 jours après votre venue. »

Les polices Google ne se chargent pas dans la plupart des clients : prévoir `font-family: 'Playfair Display', Georgia, serif` et `'Montserrat', Helvetica, Arial, sans-serif`.

L'adresse et le téléphone viennent de `site_config`, jamais du code.

---

## Les trois emails

### 1 · Confirmation

| | |
|---|---|
| **Déclencheur** | Réservation créée, après succès de `reserver()` |
| **Objet** | `Votre brunch du samedi 19 septembre est confirmé` |
| **Titre** | Votre table est réservée |
| **Corps** | « Bonjour Camille, nous vous attendons pour le brunch. Voici le récapitulatif de votre réservation. » |
| **Lignes** | Date · Heure · Personnes · Au nom de · Référence |
| **Bouton** | **Annuler ma réservation** → `{SITE_URL}/reservation/annuler?token={token en clair}` |
| **Rappel** | « Annulation en ligne possible jusqu'à 24 h avant. Ensuite, appelez le … » |

C'est le seul endroit où le jeton en clair existe. Il n'est ni journalisé, ni stocké, ni renvoyé au navigateur.

### 2 · Annulation confirmée

| | |
|---|---|
| **Déclencheur** | Le client annule depuis son lien |
| **Objet** | `Votre réservation du 19 septembre est annulée` |
| **Titre** | Annulation confirmée |
| **Corps** | « Bonjour Camille, votre réservation a bien été annulée. Nous espérons vous accueillir prochainement. » |
| **Lignes** | Date annulée · Heure · Personnes |
| **Bouton** | Réserver un nouveau créneau → `/reservation` |
| **Rappel** | « Aucune démarche supplémentaire de votre part. » |

Cet accusé de réception évite les appels du type « est-ce que mon annulation a bien été prise en compte ? ».

### 3 · Annulation par le restaurant

| | |
|---|---|
| **Déclencheur** | L'admin annule un créneau ou une réservation |
| **Objet** | `Nous devons annuler votre brunch du 11 octobre` |
| **Titre** | Nous sommes désolés |
| **Corps** | « Bonjour Camille, nous devons malheureusement annuler le service que vous aviez réservé. Toutes nos excuses pour ce contretemps. » |
| **Bloc motif** | Encart `beige-darker` : « **Motif** · Fermeture exceptionnelle de la cuisine. » — texte saisi par l'admin, repris **tel quel** |
| **Lignes** | Date annulée · Heure · Personnes |
| **Bouton** | Choisir un autre créneau → `/reservation` |
| **Rappel** | « Une question ? Appelez-nous au …, nous trouverons une solution. » |

Le motif est affiché sans reformulation : c'est la promesse faite à l'admin dans la modal (« Motif — visible dans l'email »).

---

## Envoi hors du chemin critique

Une réservation existe en base **avant** toute tentative d'envoi. Si l'email échoue, la réservation reste valide.

```ts
const id = await rpc("reserver", { ... });          // ← la source de vérité

try {
  await envoyer({ to: email, subject, react: <Confirmation … /> });
} catch (e) {
  console.error("[email] confirmation échouée", { reservationId: id, e });
  emailKo = true;                                    // ← n'annule rien
}

redirect(`/reservation/confirmation/${id}${emailKo ? "?email=ko" : ""}`);
```

Ce qu'il ne faut surtout pas faire : annuler la réservation parce que l'email n'est pas parti, ou afficher au client une erreur de réservation. La table est réservée ; c'est la notification qui a échoué, et l'écran 5 sait le dire.

### Envois groupés

À l'annulation d'un créneau, envoyer **séquentiellement** avec une petite pause (Resend limite le débit), collecter les échecs, et les afficher dans la modal à côté des clients concernés : ceux-là sont à appeler en priorité, ils n'ont rien reçu.

---

## À vérifier avant la mise en ligne

- Rendu sur Gmail (web et Android), Apple Mail (iOS), Outlook web.
- Le lien d'annulation fonctionne en un clic depuis mobile.
- Les accents passent (`charset=utf-8`) : « Réservé », « créneau », « désolés ».
- L'objet ne dépasse pas ~60 caractères, sinon il est tronqué sur mobile.
- Une version texte brut accompagne le HTML (React Email la génère).
