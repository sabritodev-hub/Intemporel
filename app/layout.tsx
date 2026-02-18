import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "L'Intemporel - Bar à Desserts",
  description:
    "Découvrez notre carte de desserts artisanaux. Un moment de douceur intemporel.",
  keywords: ["desserts", "bar à desserts", "pâtisserie", "menu", "intemporel"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-beige-light">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
