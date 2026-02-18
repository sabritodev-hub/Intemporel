"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Sliders,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/plats", label: "Plats", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Catégories", icon: FolderOpen },
  { href: "/admin/options", label: "Options", icon: Settings },
  { href: "/admin/settings", label: "Paramètres", icon: Sliders },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-beige-light">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-bordeaux transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link
              href="/admin/dashboard"
              className="font-playfair text-xl font-bold text-beige-light"
            >
              L'Intemporel
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-beige-light hover:bg-white/10 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 font-montserrat text-sm transition-colors",
                    isActive
                      ? "bg-white/20 text-beige-light"
                      : "text-beige-light/70 hover:bg-white/10 hover:text-beige-light",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 font-montserrat text-sm text-beige-light/70 hover:bg-white/10 hover:text-beige-light transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-bordeaux/10 bg-beige-light px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1 text-bordeaux hover:bg-bordeaux/10 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-playfair text-lg font-semibold text-bordeaux lg:text-xl">
              Administration
            </h1>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg bg-bordeaux px-3 py-2 font-montserrat text-sm text-beige-light hover:bg-bordeaux/90 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Voir le menu</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
