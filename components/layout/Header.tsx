import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Settings } from "lucide-react";

export default async function Header() {
  // Vérifier si l'utilisateur est connecté
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bordeaux/10 bg-beige-light/95 backdrop-blur supports-[backdrop-filter]:bg-beige-light/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-playfair text-2xl font-bold text-bordeaux">
            Intemporel
          </span>
        </Link>
        <nav className="flex items-center space-x-4">
          {user && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 rounded-lg bg-bordeaux px-3 py-2 font-montserrat text-sm text-beige-light hover:bg-bordeaux/90 transition-colors"
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
