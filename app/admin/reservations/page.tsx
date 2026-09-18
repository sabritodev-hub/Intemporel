import { createClient } from "@/lib/supabase/server";
import { cleJour, jourDeSemaine } from "@/lib/reservation/dates";
import { etatCreneau } from "@/lib/reservation/etats";
import ReservationsClient, { type BlocCreneau } from "./ReservationsClient";
import type { Creneau, Reservation } from "@/types/database.types";

export const dynamic = "force-dynamic";

function decalerJours(jour: string, delta: number): string {
  const [y, m, d] = jour.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + delta));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

/** Lundi de la semaine contenant `jour`. */
function lundiDeLaSemaine(jour: string): string {
  const dow = jourDeSemaine(jour); // 0=dimanche..6=samedi
  const offset = dow === 0 ? -6 : 1 - dow;
  return decalerJours(jour, offset);
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: { vue?: string; date?: string };
}) {
  const supabase = createClient();
  const vue = searchParams.vue === "semaine" ? "semaine" : "jour";

  const debutFenetre = decalerJours(cleJour(new Date()), -14);
  const finFenetre = decalerJours(cleJour(new Date()), 120);

  const { data: creneauxData } = await supabase
    .from("creneaux")
    .select("*")
    .gte("debut", `${debutFenetre}T00:00:00Z`)
    .lte("debut", `${finFenetre}T23:59:59Z`)
    .order("debut");

  const tousCreneaux = (creneauxData ?? []) as Creneau[];
  const ids = tousCreneaux.map((c) => c.id);

  let toutesReservations: Reservation[] = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .in("creneau_id", ids)
      .order("created_at", { ascending: false });
    toutesReservations = (data ?? []) as Reservation[];
  }

  const resasParCreneau = new Map<string, Reservation[]>();
  for (const r of toutesReservations) {
    if (!resasParCreneau.has(r.creneau_id)) resasParCreneau.set(r.creneau_id, []);
    resasParCreneau.get(r.creneau_id)!.push(r);
  }

  const creneauxParJour = new Map<string, Creneau[]>();
  for (const c of tousCreneaux) {
    const jour = cleJour(new Date(c.debut));
    if (!creneauxParJour.has(jour)) creneauxParJour.set(jour, []);
    creneauxParJour.get(jour)!.push(c);
  }

  const joursDisponibles = Array.from(creneauxParJour.keys()).sort();
  const aujourdHui = cleJour(new Date());
  const dateParDefaut =
    joursDisponibles.find((j) => j >= aujourdHui) ??
    joursDisponibles[joursDisponibles.length - 1] ??
    aujourdHui;

  const date =
    searchParams.date && joursDisponibles.includes(searchParams.date)
      ? searchParams.date
      : dateParDefaut;

  const joursAffiches =
    vue === "jour"
      ? [date]
      : (() => {
          const lundi = lundiDeLaSemaine(date);
          return Array.from({ length: 7 }, (_, i) => decalerJours(lundi, i));
        })();

  // Premier service de chaque journée (Europe/Paris), pour la clôture (règle 3).
  const premierParJour = new Map<string, number>();
  for (const c of tousCreneaux) {
    if (c.statut === "annule") continue;
    const jour = cleJour(new Date(c.debut));
    const t = new Date(c.debut).getTime();
    const actuel = premierParJour.get(jour);
    if (actuel === undefined || t < actuel) premierParJour.set(jour, t);
  }
  const maintenant = Date.now();

  const blocs: BlocCreneau[] = [];
  for (const jour of joursAffiches) {
    for (const c of creneauxParJour.get(jour) ?? []) {
      const resasDuCreneau = resasParCreneau.get(c.id) ?? [];
      const couvertsActifs = resasDuCreneau
        .filter((r) => r.statut === "confirmee" || r.statut === "venue")
        .reduce((somme, r) => somme + r.couverts, 0);
      const placesRestantes = Math.max(c.capacite - couvertsActifs, 0);
      const premierDebut = premierParJour.get(jour) ?? Infinity;
      const journeeClose = maintenant >= premierDebut;

      blocs.push({
        creneau: {
          id: c.id,
          debut: c.debut,
          fin: c.fin,
          capacite: c.capacite,
          statut: c.statut,
          couvertsReserves: couvertsActifs,
          etat: etatCreneau({
            places_restantes: placesRestantes,
            capacite: c.capacite,
            statut: c.statut,
            reservable: c.statut === "ouvert" && !journeeClose && placesRestantes > 0,
            journee_close: journeeClose,
          }),
        },
        jour,
        reservations: resasDuCreneau.map((r) => ({
          id: r.id,
          nom: r.nom ?? "(anonymisé)",
          telephone: r.telephone,
          email: r.email,
          couverts: r.couverts,
          statut: r.statut,
          createdAt: r.created_at,
        })),
      });
    }
  }

  // Navigation : jour/semaine précédent-suivant parmi les jours ayant des créneaux.
  const indexCourant = joursDisponibles.indexOf(date);
  const jourPrecedent = indexCourant > 0 ? joursDisponibles[indexCourant - 1] : null;
  const jourSuivant =
    indexCourant >= 0 && indexCourant < joursDisponibles.length - 1
      ? joursDisponibles[indexCourant + 1]
      : null;

  const semainePrecedente = decalerJours(date, -7);
  const semaineSuivante = decalerJours(date, 7);

  return (
    <ReservationsClient
      vue={vue}
      date={date}
      blocs={blocs}
      jourPrecedent={jourPrecedent}
      jourSuivant={jourSuivant}
      semainePrecedente={semainePrecedente}
      semaineSuivante={semaineSuivante}
      creneauxDisponibles={tousCreneaux
        .filter((c) => joursAffiches.includes(cleJour(new Date(c.debut))))
        .map((c) => ({ id: c.id, debut: c.debut, fin: c.fin }))}
    />
  );
}
