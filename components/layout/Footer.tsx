"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-bordeaux/10 bg-beige-darker py-8">
      <div className="container">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="font-playfair text-xl font-semibold text-bordeaux">
            L'Intemporel
          </p>
          <p className="text-center text-sm text-bordeaux/70">
            Un moment de douceur hors du temps
          </p>
          <p className="text-xs text-bordeaux/50">
            © {new Date().getFullYear()} L'Intemporel. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-montserrat text-xs text-bordeaux/60">
            <Link href="/confidentialite" className="hover:text-bordeaux">
              Confidentialité
            </Link>
            <Link href="/cgu" className="hover:text-bordeaux">
              CGU
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event("ouvrir-panneau-cookies"))}
              className="hover:text-bordeaux"
            >
              Gérer les cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
