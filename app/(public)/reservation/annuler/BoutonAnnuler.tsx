"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { annulerReservation } from "./actions";

export default function BoutonAnnuler({ tokenHash }: { tokenHash: string }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const handleClick = async () => {
    setEnvoi(true);
    setErreur(null);
    const resultat = await annulerReservation(tokenHash);
    if (resultat.error) {
      setErreur(resultat.error);
      setEnvoi(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={envoi}
        className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-bordeaux font-montserrat text-base font-semibold text-beige-light transition-colors hover:bg-bordeaux-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {envoi ? "Annulation en cours…" : "Annuler ma réservation"}
      </button>
      {erreur && <p className="text-center text-sm font-semibold text-bordeaux">{erreur}</p>}
    </div>
  );
}
