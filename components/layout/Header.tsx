import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { Settings, CalendarCheck } from "lucide-react";

export default async function Header() {
  // Vérifier si l'utilisateur est connecté
  const supabase = createClient();
  const [
    {
      data: { user },
    },
    cfg,
  ] = await Promise.all([supabase.auth.getUser(), config()]);

  const reservationsActives = cfg.reservations_actives !== "false";

  return (
    <header className="sticky top-0 z-50 h-[60px] w-full bg-bordeaux">
      <div className="container flex h-[60px] flex-nowrap items-center justify-between gap-3">
        <Link href="/" className="min-w-0 flex-1 overflow-hidden">
          <span
            className="block truncate font-playfair font-bold text-beige-light"
            style={{ fontSize: "clamp(17px, 4.6vw, 20px)" }}
          >
            L'Intemporel
          </span>
        </Link>
        <nav className="flex flex-none flex-nowrap items-center gap-2">
          {reservationsActives && (
            <Link
              href="/reservation"
              className="flex flex-none items-center gap-2 rounded-lg bg-beige px-3 py-2 font-montserrat text-sm font-semibold text-bordeaux hover:bg-beige-darker transition-colors"
            >
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Réserver</span>
            </Link>
          )}
          {user && (
            <Link
              href="/admin/dashboard"
              className="flex flex-none items-center gap-2 rounded-lg border border-beige-light/40 px-3 py-2 font-montserrat text-sm text-beige-light hover:bg-beige-light hover:text-bordeaux transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Administration</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
