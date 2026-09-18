import Link from "next/link";
import { config } from "@/lib/config";
import { afficher } from "@/lib/reservation/telephone";

export default async function NotFound() {
  const cfg = await config();
  const telephoneAffiche = cfg.telephone_restaurant ? afficher(cfg.telephone_restaurant) : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center space-y-6 px-4 text-center">
      <p
        className="font-playfair font-bold text-bordeaux/20"
        style={{ fontSize: "clamp(64px, 20vw, 150px)", lineHeight: 1 }}
      >
        404
      </p>
      <span className="h-px w-16 bg-bordeaux/30" />
      <h1 className="font-playfair text-2xl font-bold text-bordeaux">
        Cette page a quitté la carte
      </h1>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="flex min-h-[48px] items-center rounded-lg bg-bordeaux px-5 font-montserrat text-sm font-semibold text-beige-light hover:bg-bordeaux-dark"
        >
          Voir la carte
        </Link>
        <Link
          href="/reservation"
          className="flex min-h-[48px] items-center rounded-lg border border-bordeaux/30 px-5 font-montserrat text-sm font-semibold text-bordeaux hover:bg-bordeaux hover:text-beige-light"
        >
          Réserver le brunch
        </Link>
      </div>

      <p className="max-w-sm font-montserrat text-sm text-bordeaux/60">
        Vous cherchiez à annuler une réservation ? Le lien d'annulation se
        trouve uniquement dans votre email de confirmation.
        {telephoneAffiche && (
          <>
            {" "}
            Sinon, appelez-nous au{" "}
            <a href={`tel:${telephoneAffiche.replace(/\s/g, "")}`} className="underline">
              {telephoneAffiche}
            </a>
            .
          </>
        )}
      </p>
    </div>
  );
}
