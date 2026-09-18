import { createClient } from "@/lib/supabase/server";
import { cleJour, cleMois, decalerMois } from "@/lib/reservation/dates";
import { etatCreneau, type Etat } from "@/lib/reservation/etats";
import CreneauxClient, { type CreneauAvecEtat, type ModeleRow } from "./CreneauxClient";

async function chargerModeles() {
  const supabase = createClient();
  const { data } = await supabase
    .from("modeles_creneaux")
    .select("*")
    .order("jour_semaine", { ascending: false }) // 6 (samedi) avant 0 (dimanche)
    .order("heure_debut", { ascending: true });
  return (data ?? []) as ModeleRow[];
}

async function chargerCreneauxDuMois(mois: string) {
  const supabase = createClient();

  // Marge de 24h de chaque côté pour absorber le décalage UTC / Europe/Paris,
  // le tri précis par jour se fait ensuite via cleJour() (Intl, correct en TZ).
  const [y, m] = mois.split("-").map(Number);
  const debutRequete = new Date(Date.UTC(y, m - 1, 1) - 24 * 3600 * 1000).toISOString();
  const finRequete = new Date(Date.UTC(y, m, 1) + 24 * 3600 * 1000).toISOString();

  const { data: creneaux } = await supabase
    .from("creneaux")
    .select("*")
    .gte("debut", debutRequete)
    .lt("debut", finRequete)
    .order("debut", { ascending: true });

  const tous = creneaux ?? [];

  // Occupation réelle par créneau (0 tant que le parcours public n'existe pas).
  const ids = tous.map((c) => c.id);
  const occupationParCreneau = new Map<string, number>();
  const nbReservationsParCreneau = new Map<string, number>();
  if (ids.length > 0) {
    const { data: resas } = await supabase
      .from("reservations")
      .select("creneau_id, couverts")
      .in("creneau_id", ids)
      .in("statut", ["confirmee", "venue"]);
    for (const r of resas ?? []) {
      occupationParCreneau.set(
        r.creneau_id,
        (occupationParCreneau.get(r.creneau_id) ?? 0) + r.couverts,
      );
      nbReservationsParCreneau.set(
        r.creneau_id,
        (nbReservationsParCreneau.get(r.creneau_id) ?? 0) + 1,
      );
    }
  }

  // Premier service de chaque journée (Europe/Paris), pour la clôture (règle 3).
  const premierParJour = new Map<string, number>();
  for (const c of tous) {
    if (c.statut === "annule") continue;
    const jour = cleJour(new Date(c.debut));
    const t = new Date(c.debut).getTime();
    const actuel = premierParJour.get(jour);
    if (actuel === undefined || t < actuel) premierParJour.set(jour, t);
  }

  const maintenant = Date.now();

  const creneauxAvecEtat: CreneauAvecEtat[] = tous.map((c) => {
    const jour = cleJour(new Date(c.debut));
    const occupees = occupationParCreneau.get(c.id) ?? 0;
    const placesRestantes = Math.max(c.capacite - occupees, 0);
    const premierDebut = premierParJour.get(jour) ?? Infinity;
    const journeeClose = maintenant >= premierDebut;
    const reservable = c.statut === "ouvert" && !journeeClose && placesRestantes > 0;

    const etat: Etat = etatCreneau({
      places_restantes: placesRestantes,
      capacite: c.capacite,
      statut: c.statut,
      reservable,
      journee_close: journeeClose,
    });

    return {
      id: c.id,
      debut: c.debut,
      fin: c.fin,
      capacite: c.capacite,
      statut: c.statut,
      couverts_reserves: occupees,
      places_restantes: placesRestantes,
      nb_reservations: nbReservationsParCreneau.get(c.id) ?? 0,
      etat,
    };
  });

  // Ne garder que les créneaux dont le jour Europe/Paris tombe dans le mois demandé.
  const parJour = new Map<string, CreneauAvecEtat[]>();
  for (const c of creneauxAvecEtat) {
    const jour = cleJour(new Date(c.debut));
    if (!jour.startsWith(mois)) continue;
    if (!parJour.has(jour)) parJour.set(jour, []);
    parJour.get(jour)!.push(c);
  }

  return parJour;
}

export default async function CreneauxPage({
  searchParams,
}: {
  searchParams: { mois?: string };
}) {
  const mois = searchParams.mois ?? cleMois(new Date());

  const [modeles, creneauxParJour] = await Promise.all([
    chargerModeles(),
    chargerCreneauxDuMois(mois),
  ]);

  const parJourObj: Record<string, CreneauAvecEtat[]> = Object.fromEntries(
    creneauxParJour,
  );

  return (
    <CreneauxClient
      modeles={modeles}
      mois={mois}
      moisPrecedent={decalerMois(mois, -1)}
      moisSuivant={decalerMois(mois, 1)}
      creneauxParJour={parJourObj}
    />
  );
}
