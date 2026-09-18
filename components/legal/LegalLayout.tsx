import Link from "next/link";
import { cn } from "@/lib/utils";

interface LegalLayoutProps {
  surTitre: string;
  titre: string;
  chapeau: string;
  derniereMaj: string;
  children: React.ReactNode;
  emailContact: string;
  telephoneAffiche: string | null;
}

export default function LegalLayout({
  surTitre,
  titre,
  chapeau,
  derniereMaj,
  children,
  emailContact,
  telephoneAffiche,
}: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-[860px] space-y-10 px-4 py-10">
      <div className="border-b border-[#f0ead4] pb-6">
        <p className="font-montserrat text-[11px] uppercase tracking-[.2em] text-bordeaux-light">
          {surTitre}
        </p>
        <h1
          className="mt-2 font-playfair font-bold text-bordeaux"
          style={{ fontSize: "clamp(32px, 7.5vw, 48px)" }}
        >
          {titre}
        </h1>
        <p className="mt-3 font-montserrat text-[15px] text-bordeaux/70">{chapeau}</p>
        <p className="mt-2 font-montserrat text-xs text-bordeaux/50">
          Dernière mise à jour : {derniereMaj}
        </p>
      </div>

      <div className="space-y-8">{children}</div>

      <div className="rounded-xl border border-bordeaux/10 bg-white p-6 text-center">
        <p className="font-playfair text-lg text-bordeaux">Une question sur vos données ?</p>
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          {emailContact && (
            <a
              href={`mailto:${emailContact}`}
              className="flex min-h-[48px] items-center justify-center rounded-lg bg-bordeaux px-5 font-montserrat text-sm font-semibold text-beige-light hover:bg-bordeaux-dark"
            >
              Nous écrire
            </a>
          )}
          {telephoneAffiche && (
            <a
              href={`tel:${telephoneAffiche.replace(/\s/g, "")}`}
              className="flex min-h-[48px] items-center justify-center rounded-lg border border-bordeaux/30 px-5 font-montserrat text-sm font-semibold text-bordeaux hover:bg-bordeaux hover:text-beige-light"
            >
              {telephoneAffiche}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function Section({
  numero,
  titre,
  children,
}: {
  numero: string;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-[#f0ead4] pt-6 first:border-0 first:pt-0">
      <div className="flex items-baseline gap-3">
        <span className="font-montserrat text-xs text-bordeaux-light">{numero}</span>
        <h2 className="font-playfair text-xl text-bordeaux">{titre}</h2>
      </div>
      <div className="space-y-3 font-montserrat text-sm leading-[1.75] text-[#6b2135]">
        {children}
      </div>
    </section>
  );
}

export function Tableau({ lignes }: { lignes: { cle: string; valeur: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-bordeaux/10 bg-white">
      {lignes.map((l, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-1 p-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
            i > 0 && "border-t border-[#f0ead4]",
          )}
        >
          <span className="text-bordeaux/70">{l.cle}</span>
          <span className="font-semibold text-bordeaux sm:text-right">{l.valeur}</span>
        </div>
      ))}
    </div>
  );
}

export function Liste({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function Encart({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg bg-beige-darker p-4 text-sm text-bordeaux">{children}</div>;
}

export function LienInterne({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="underline">
      {children}
    </Link>
  );
}
