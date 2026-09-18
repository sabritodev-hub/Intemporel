import { parsePhoneNumberFromString } from "libphonenumber-js";

/** Normalise une saisie française en E.164 (+33612345678). Retourne null si invalide. */
export function normaliser(saisie: string): string | null {
  const t = parsePhoneNumberFromString(saisie, "FR");
  return t?.isValid() ? t.number : null;
}

/** Affiche un numéro E.164 au format national français (06 12 34 56 78). */
export function afficher(e164: string): string {
  const t = parsePhoneNumberFromString(e164);
  return t?.formatNational() ?? e164;
}
