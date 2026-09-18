"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CLE = "intemporel_cookies_vu";
const SIX_MOIS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

/** Mode "information" : le site ne pose que des cookies exemptés de consentement. */
export default function BandeauCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE);
      const date = brut ? Number(brut) : 0;
      if (Date.now() - date > SIX_MOIS_MS) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const fermer = () => {
    try {
      localStorage.setItem(CLE, String(Date.now()));
    } catch {
      // localStorage indisponible : le bandeau réapparaîtra, sans conséquence.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-bordeaux/10 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,.08)]">
      <div className="container flex flex-wrap items-center justify-between gap-3">
        <p className="font-montserrat text-sm text-bordeaux/80">
          Ce site n'utilise que les cookies nécessaires à la réservation.{" "}
          <Link href="/confidentialite" className="underline">
            En savoir plus
          </Link>
          .
        </p>
        <Button onClick={fermer}>J'ai compris</Button>
      </div>
    </div>
  );
}
