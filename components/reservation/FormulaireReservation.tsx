"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { reservationSchema } from "@/lib/reservation/schemas";
import { reserver } from "@/app/(public)/reservation/actions";
import SelecteurCouverts from "./SelecteurCouverts";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void },
      ) => void;
    };
  }
}

function useTurnstile(onToken: (token: string) => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !ref.current) return;

    const rendre = () => {
      if (window.turnstile && ref.current) {
        window.turnstile.render(ref.current, { sitekey: siteKey, callback: onToken });
      }
    };

    const scriptId = "turnstile-script";
    if (document.getElementById(scriptId)) {
      rendre();
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = rendre;
    document.body.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

interface FormulaireReservationProps {
  creneauId: string;
  date: string;
  telephoneAffiche: string | null;
}

type ChampErreur = "nom" | "email" | "telephone";

export default function FormulaireReservation({
  creneauId,
  date,
  telephoneAffiche,
}: FormulaireReservationProps) {
  const [couverts, setCouverts] = useState(2);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [consentement, setConsentement] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const [erreursChamps, setErreursChamps] = useState<Partial<Record<ChampErreur, string>>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [complet, setComplet] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  const turnstileRef = useTurnstile(setTurnstileToken);

  const validerChamp = (champ: ChampErreur, valeur: string) => {
    const shape = reservationSchema.shape[champ];
    const resultat = shape.safeParse(valeur);
    setErreursChamps((prev) => ({
      ...prev,
      [champ]: resultat.success ? undefined : resultat.error.issues[0]?.message,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreurGenerale(null);
    setComplet(false);

    if (envoi) return;
    setEnvoi(true);

    try {
      const resultat = await reserver({
        creneauId,
        nom,
        email,
        telephone,
        couverts,
        consentement,
        turnstileToken,
        honeypot,
      });

      if (resultat?.error) {
        if (resultat.complet) {
          setComplet(true);
        } else {
          setErreurGenerale(resultat.error);
        }
        setEnvoi(false);
        return;
      }

      // Honeypot déclenché : faux succès, rien n'a été inséré.
      if (resultat?.success) {
        setEnvoi(false);
        return;
      }
      // Sinon, la server action a déjà redirigé vers la confirmation.
    } catch (err) {
      // NEXT_REDIRECT n'est pas une vraie erreur : on la laisse remonter.
      throw err;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot invisible : jamais type="hidden" (ignoré par les robots) */}
      <div style={{ position: "absolute", left: -9999, top: -9999 }} aria-hidden="true">
        <label htmlFor="site_web">Site web</label>
        <input
          id="site_web"
          name="site_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <p className="text-center font-montserrat text-sm font-semibold text-bordeaux">
          Nombre de personnes
        </p>
        <SelecteurCouverts
          value={couverts}
          onChange={setCouverts}
          telephoneAffiche={telephoneAffiche}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom</Label>
          <Input
            id="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            onBlur={(e) => validerChamp("nom", e.target.value)}
            className={cn("min-h-[48px]", erreursChamps.nom && "border-[1.5px] border-bordeaux")}
            aria-invalid={!!erreursChamps.nom}
            aria-describedby={erreursChamps.nom ? "nom-erreur" : undefined}
            required
          />
          {erreursChamps.nom && (
            <p id="nom-erreur" className="text-[11px] font-semibold text-bordeaux">
              {erreursChamps.nom}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => validerChamp("email", e.target.value)}
            className={cn("min-h-[48px]", erreursChamps.email && "border-[1.5px] border-bordeaux")}
            aria-invalid={!!erreursChamps.email}
            aria-describedby={erreursChamps.email ? "email-erreur" : undefined}
            required
          />
          {erreursChamps.email && (
            <p id="email-erreur" className="text-[11px] font-semibold text-bordeaux">
              {erreursChamps.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            onBlur={(e) => validerChamp("telephone", e.target.value)}
            className={cn(
              "min-h-[48px]",
              erreursChamps.telephone && "border-[1.5px] border-bordeaux",
            )}
            aria-invalid={!!erreursChamps.telephone}
            aria-describedby={erreursChamps.telephone ? "telephone-erreur" : "telephone-aide"}
            required
          />
          {erreursChamps.telephone ? (
            <p id="telephone-erreur" className="text-[11px] font-semibold text-bordeaux">
              {erreursChamps.telephone}
            </p>
          ) : (
            <p id="telephone-aide" className="text-sm text-bordeaux/60">
              Pour vous joindre en cas d'imprévu.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="consentement"
          checked={consentement}
          onCheckedChange={(v) => setConsentement(v === true)}
          className="mt-0.5 h-[22px] w-[22px]"
          required
        />
        <Label htmlFor="consentement" className="text-sm font-normal leading-snug text-bordeaux/80">
          J'accepte que mes informations soient utilisées pour ma réservation,
          conformément à la{" "}
          <Link href="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </Label>
      </div>

      <div ref={turnstileRef} />

      {complet && (
        <div className="rounded-lg bg-bordeaux p-4 text-center">
          <p className="font-montserrat text-sm text-beige-light">
            Ce créneau vient d'être complété.{" "}
            <Link href={`/reservation/${date}`} className="font-semibold underline">
              Choisir un autre horaire
            </Link>
            .
          </p>
        </div>
      )}

      {erreurGenerale && !complet && (
        <p className="text-center text-sm font-semibold text-bordeaux">{erreurGenerale}</p>
      )}

      <button
        type="submit"
        disabled={envoi || !consentement || !turnstileToken}
        className={cn(
          "flex min-h-[52px] w-full items-center justify-center rounded-lg font-montserrat text-base font-semibold transition-colors",
          envoi
            ? "cursor-not-allowed bg-[#a8798a] text-beige-light"
            : "bg-bordeaux text-beige-light hover:bg-bordeaux-dark disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {envoi ? "Envoi en cours…" : "Confirmer ma réservation"}
      </button>
    </form>
  );
}
