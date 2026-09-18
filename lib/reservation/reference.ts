const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3479"; // ni 0/O, ni 1/I, ni S/5, ni 8/B

/** Référence lisible au téléphone, format BR-7F42. */
export function genererReference() {
  const c = Array.from({ length: 4 }, () =>
    ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  ).join("");
  return `BR-${c}`;
}
