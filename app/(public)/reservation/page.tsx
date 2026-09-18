import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { cleMois } from "@/lib/reservation/dates";
import { afficher } from "@/lib/reservation/telephone";
import type { CreneauPublic } from "@/types/database.types";
import ReservationCalendrier from "./ReservationCalendrier";

export const dynamic = "force-dynamic";

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: { mois?: string };
}) {
  const supabase = createClient();
  const cfg = await config();

  const moisCourant = cleMois(new Date());
  const moisSuivant = cleMois(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15),
  );

  const mois = [moisCourant, moisSuivant].includes(searchParams.mois ?? "")
    ? (searchParams.mois as string)
    : moisCourant;

  if (cfg.reservations_actives === "false") {
    const telephone = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
        <h1 className="font-playfair text-2xl font-bold text-bordeaux">
          Les réservations en ligne sont momentanément fermées
        </h1>
        {telephone && (
          <p className="font-montserrat text-bordeaux/70">
            Pour réserver, appelez-nous au{" "}
            <a href={`tel:${telephone.replace(/\s/g, "")}`} className="font-semibold underline">
              {telephone}
            </a>
          </p>
        )}
      </div>
    );
  }

  const { data } = await supabase.from("creneaux_publics").select("*").order("debut");
  const tous = (data ?? []) as CreneauPublic[];

  const creneauxParJour: Record<string, CreneauPublic[]> = {};
  for (const c of tous) {
    if (!c.jour) continue;
    if (!creneauxParJour[c.jour]) creneauxParJour[c.jour] = [];
    creneauxParJour[c.jour].push(c);
  }

  const moisCourantADesCreneaux = Object.keys(creneauxParJour).some((j) =>
    j.startsWith(moisCourant),
  );
  const moisSuivantADesCreneaux = Object.keys(creneauxParJour).some((j) =>
    j.startsWith(moisSuivant),
  );

  return (
    <ReservationCalendrier
      mois={mois}
      moisCourant={moisCourant}
      moisSuivant={moisSuivant}
      moisCourantADesCreneaux={moisCourantADesCreneaux}
      moisSuivantADesCreneaux={moisSuivantADesCreneaux}
      creneauxParJour={creneauxParJour}
    />
  );
}
