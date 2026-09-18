"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { afficher } from "@/lib/reservation/telephone";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [telephoneAffiche, setTelephoneAffiche] = useState<string | null>(null);

  useEffect(() => {
    console.error(error);
    createClient()
      .from("site_config")
      .select("value")
      .eq("key", "telephone_restaurant")
      .single()
      .then(({ data }) => {
        if (data?.value) setTelephoneAffiche(afficher(data.value));
      });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center space-y-6 px-4 text-center">
      <p
        className="font-playfair font-bold text-bordeaux/20"
        style={{ fontSize: "clamp(64px, 20vw, 150px)", lineHeight: 1 }}
      >
        500
      </p>
      <span className="h-px w-16 bg-bordeaux/30" />
      <h1 className="font-playfair text-2xl font-bold text-bordeaux">
        Une erreur est survenue
      </h1>

      <p className="max-w-sm font-montserrat text-sm font-semibold text-bordeaux">
        Si vous étiez en train de réserver, votre réservation n'a pas été
        enregistrée. Réessayez, ou appelez-nous.
        {telephoneAffiche && (
          <>
            {" "}
            <a href={`tel:${telephoneAffiche.replace(/\s/g, "")}`} className="underline">
              {telephoneAffiche}
            </a>
          </>
        )}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="flex min-h-[48px] items-center rounded-lg bg-bordeaux px-5 font-montserrat text-sm font-semibold text-beige-light hover:bg-bordeaux-dark"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="flex min-h-[48px] items-center rounded-lg border border-bordeaux/30 px-5 font-montserrat text-sm font-semibold text-bordeaux hover:bg-bordeaux hover:text-beige-light"
        >
          Voir la carte
        </Link>
      </div>
    </div>
  );
}
