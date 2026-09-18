import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { config } from "@/lib/config";
import { genererIcs } from "@/lib/reservation/ics";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const cfg = await config();

  const { data } = await supabase
    .from("reservations")
    .select("reference, couverts, creneaux(debut, fin)")
    .eq("id", params.id)
    .single();

  if (!data) {
    return new NextResponse("Réservation introuvable", { status: 404 });
  }

  const creneau = data.creneaux as unknown as { debut: string; fin: string } | null;
  if (!creneau) {
    return new NextResponse("Réservation introuvable", { status: 404 });
  }

  const ics = genererIcs({
    id: params.id,
    debut: new Date(creneau.debut),
    fin: new Date(creneau.fin),
    couverts: data.couverts,
    reference: data.reference,
    adresse: cfg.adresse_restaurant ?? "",
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="brunch-lintemporel.ics"',
    },
  });
}
