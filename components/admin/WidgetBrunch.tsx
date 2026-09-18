import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cleJour, jourLong } from "@/lib/reservation/dates";
import { etatCreneau } from "@/lib/reservation/etats";
import JaugeRemplissage from "@/components/reservation/JaugeRemplissage";

export default async function WidgetBrunch() {
  const supabase = createClient();

  const { data: creneaux } = await supabase
    .from("creneaux")
    .select("*")
    .neq("statut", "annule")
    .gte("debut", new Date().toISOString())
    .order("debut")
    .limit(20);

  const tous = creneaux ?? [];
  const ids = tous.map((c) => c.id);

  let reservations: { creneau_id: string; couverts: number; statut: string }[] = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from("reservations")
      .select("creneau_id, couverts, statut")
      .in("creneau_id", ids);
    reservations = data ?? [];
  }

  const parJour = new Map<string, typeof tous>();
  for (const c of tous) {
    const jour = cleJour(new Date(c.debut));
    if (!parJour.has(jour)) parJour.set(jour, []);
    parJour.get(jour)!.push(c);
  }

  const prochainsJours = Array.from(parJour.keys()).sort().slice(0, 2);

  if (prochainsJours.length === 0) {
    return null;
  }

  return (
    <Card className="max-w-[520px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-playfair text-xl text-bordeaux">Brunch ce weekend</CardTitle>
        <Link href="/admin/reservations" className="font-montserrat text-sm text-bordeaux underline">
          Voir les réservations
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {prochainsJours.map((jour) => {
          const creneauxDuJour = parJour.get(jour)!;
          const idsJour = new Set(creneauxDuJour.map((c) => c.id));
          const resasDuJour = reservations.filter(
            (r) => idsJour.has(r.creneau_id) && r.statut !== "annulee_client" && r.statut !== "annulee_restaurant",
          );
          const couverts = resasDuJour.reduce((s, r) => s + r.couverts, 0);
          const capacite = creneauxDuJour.reduce((s, c) => s + c.capacite, 0);

          const etat = etatCreneau({
            places_restantes: Math.max(capacite - couverts, 0),
            capacite,
            statut: "ouvert",
            reservable: false,
            journee_close: false,
          });

          return (
            <div key={jour} className="space-y-2 border-t border-bordeaux/10 pt-3 first:border-0 first:pt-0">
              <div className="flex items-center justify-between">
                <p className="font-playfair text-base capitalize text-bordeaux">
                  {jourLong(new Date(`${jour}T12:00:00Z`))}
                </p>
                <p className="font-montserrat text-sm font-semibold text-bordeaux">
                  {couverts} / {capacite} couverts
                </p>
              </div>
              <JaugeRemplissage
                occupees={couverts}
                capacite={capacite}
                etat={etat}
                hauteur={9}
                texte={`${resasDuJour.length} réservation${resasDuJour.length > 1 ? "s" : ""} · ${creneauxDuJour.length} service${creneauxDuJour.length > 1 ? "s" : ""}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
