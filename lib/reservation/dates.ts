const TZ = "Europe/Paris";

export const jourLong = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d); // samedi 19 septembre 2026

export const jourCourt = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  }).format(d); // dim. 11 oct.

export const heure = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  })
    .format(d)
    .replace(":", "h"); // 10h00

export const plage = (debut: Date, fin: Date) => `${heure(debut)} – ${heure(fin)}`;

/** Clé de date locale, pour les segments d'URL /reservation/2026-09-19 */
export const cleJour = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // 2026-09-19

/** Clé de mois locale, pour la navigation du calendrier admin (2026-10) */
export const cleMois = (d: Date) => cleJour(d).slice(0, 7);

/** Décale une clé de mois ("2026-10") de `delta` mois. */
export function decalerMois(mois: string, delta: number): string {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** 0=dimanche .. 6=samedi, comme extract(dow) côté Postgres. */
export function jourDeSemaine(jourCle: string): number {
  const [y, m, d] = jourCle.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Grille 7 colonnes (Lundi-Dimanche) d'un mois, `null` pour les cases de bordure. */
export function construireGrilleMois(mois: string): (string | null)[] {
  const [y, m] = mois.split("-").map(Number);
  const jsWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0=dimanche
  const offsetLundi = (jsWeekday + 6) % 7;
  const nbJours = new Date(Date.UTC(y, m, 0)).getUTCDate();

  const cellules: (string | null)[] = Array(offsetLundi).fill(null);
  for (let j = 1; j <= nbJours; j++) {
    cellules.push(`${mois}-${String(j).padStart(2, "0")}`);
  }
  while (cellules.length % 7 !== 0) cellules.push(null);
  return cellules;
}
