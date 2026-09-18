import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, CalendarPlus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { config } from "@/lib/config";
import { jourLong, heure } from "@/lib/reservation/dates";
import { afficher } from "@/lib/reservation/telephone";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { email?: string };
}) {
  const supabase = createAdminClient();
  const cfg = await config();

  // Volontairement : ni nom, ni email, ni téléphone ne sont sélectionnés ici.
  const { data } = await supabase
    .from("reservations")
    .select("reference, couverts, creneaux(debut, fin)")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  const creneau = data.creneaux as unknown as { debut: string; fin: string } | null;
  if (!creneau) notFound();

  const debut = new Date(creneau.debut);
  const emailKo = searchParams.email === "ko";
  const telephone = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div className="rounded-xl bg-bordeaux p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-beige-light" />
        <h1 className="mt-3 font-playfair text-2xl font-bold text-beige-light">
          Votre table est réservée
        </h1>
        {emailKo ? (
          <p className="mt-2 font-montserrat text-sm text-beige-light/90">
            Nous n'avons pas pu envoyer l'email de confirmation. Notez votre
            référence <strong>{data.reference}</strong> — votre table est bien
            réservée.
          </p>
        ) : (
          <p className="mt-2 font-montserrat text-sm text-beige-light/90">
            Un email de confirmation vous a été envoyé.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-bordeaux/10 bg-white p-5">
        <dl className="space-y-2 font-montserrat text-sm">
          <div className="flex justify-between">
            <dt className="text-bordeaux/60">Date</dt>
            <dd className="font-semibold capitalize text-bordeaux">{jourLong(debut)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-bordeaux/60">Heure</dt>
            <dd className="font-semibold text-bordeaux">{heure(debut)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-bordeaux/60">Personnes</dt>
            <dd className="font-semibold text-bordeaux">{data.couverts}</dd>
          </div>
          <div className="flex justify-between border-t border-[#f0ead4] pt-2">
            <dt className="text-bordeaux/60">Référence</dt>
            <dd className="font-playfair font-semibold text-bordeaux">{data.reference}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg bg-beige-darker/60 p-4 font-montserrat text-sm text-bordeaux/80">
        <p className="font-semibold text-bordeaux">Annulation</p>
        <p className="mt-1">
          Possible jusqu'à 24 h avant, depuis le lien reçu par email.
          {telephone && (
            <>
              {" "}
              Ensuite, appelez-nous au{" "}
              <a href={`tel:${telephone.replace(/\s/g, "")}`} className="font-semibold underline">
                {telephone}
              </a>
              .
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={`/reservation/confirmation/${params.id}/calendrier.ics`}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg border border-bordeaux/30 font-montserrat text-sm font-semibold text-bordeaux hover:bg-bordeaux hover:text-beige-light"
        >
          <CalendarPlus className="h-4 w-4" /> Ajouter au calendrier
        </a>
        <Link
          href="/"
          className="flex min-h-[48px] flex-1 items-center justify-center rounded-lg bg-bordeaux font-montserrat text-sm font-semibold text-beige-light hover:bg-bordeaux-dark"
        >
          Voir la carte
        </Link>
      </div>
    </div>
  );
}
