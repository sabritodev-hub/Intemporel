function echapper(texte: string) {
  return texte
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

function formaterUtc(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function genererIcs(opts: {
  id: string;
  debut: Date;
  fin: Date;
  couverts: number;
  reference: string;
  adresse: string;
}): string {
  const personnes = `${opts.couverts} personne${opts.couverts > 1 ? "s" : ""}`;

  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//L'Intemporel//Reservation//FR",
    "BEGIN:VEVENT",
    `UID:${opts.id}@lintemporel.fr`,
    `DTSTAMP:${formaterUtc(new Date())}`,
    `DTSTART:${formaterUtc(opts.debut)}`,
    `DTEND:${formaterUtc(opts.fin)}`,
    `SUMMARY:${echapper(`Brunch à L'Intemporel — ${personnes}`)}`,
    `LOCATION:${echapper(opts.adresse)}`,
    `DESCRIPTION:${echapper(
      `Référence ${opts.reference}. Annulation jusqu'à 24 h avant depuis votre email de confirmation.`,
    )}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lignes.join("\r\n");
}
