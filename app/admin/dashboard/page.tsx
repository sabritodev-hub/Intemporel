import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UtensilsCrossed,
  FolderOpen,
  Settings,
  CheckCircle,
} from "lucide-react";

async function getStats() {
  console.log("📊 [Dashboard] Chargement des statistiques...");

  const supabase = createClient();

  const [platsResult, categoriesResult, optionTypesResult] = await Promise.all([
    supabase.from("plats").select("id, available", { count: "exact" }),
    supabase.from("categories").select("id", { count: "exact" }),
    supabase.from("option_types").select("id", { count: "exact" }),
  ]);

  console.log("📊 [Dashboard] Résultats:", {
    plats: { count: platsResult.count, error: platsResult.error?.message },
    categories: {
      count: categoriesResult.count,
      error: categoriesResult.error?.message,
    },
    optionTypes: {
      count: optionTypesResult.count,
      error: optionTypesResult.error?.message,
    },
  });

  if (platsResult.error) {
    console.error("❌ [Dashboard] Erreur plats:", platsResult.error);
  }
  if (categoriesResult.error) {
    console.error("❌ [Dashboard] Erreur categories:", categoriesResult.error);
  }
  if (optionTypesResult.error) {
    console.error(
      "❌ [Dashboard] Erreur option_types:",
      optionTypesResult.error,
    );
  }

  const availablePlats =
    platsResult.data?.filter((p) => p.available).length || 0;

  return {
    totalPlats: platsResult.count || 0,
    availablePlats,
    totalCategories: categoriesResult.count || 0,
    totalOptionTypes: optionTypesResult.count || 0,
  };
}

export default async function DashboardPage() {
  console.log("📊 [Dashboard] Rendu de la page dashboard");

  const stats = await getStats();

  console.log("📊 [Dashboard] Stats finales:", stats);

  const cards = [
    {
      title: "Total Plats",
      value: stats.totalPlats,
      icon: UtensilsCrossed,
      description: "Nombre total de desserts",
    },
    {
      title: "Disponibles",
      value: stats.availablePlats,
      icon: CheckCircle,
      description: "Desserts en stock",
    },
    {
      title: "Catégories",
      value: stats.totalCategories,
      icon: FolderOpen,
      description: "Catégories de desserts",
    },
    {
      title: "Types d'options",
      value: stats.totalOptionTypes,
      icon: Settings,
      description: "Sauces, tailles, etc.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-bordeaux">
          Dashboard
        </h1>
        <p className="mt-1 font-montserrat text-bordeaux/70">
          Vue d'ensemble de votre menu
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-bordeaux/70">
                {card.title}
              </CardTitle>
              <card.icon className="h-5 w-5 text-bordeaux/50" />
            </CardHeader>
            <CardContent>
              <div className="font-playfair text-3xl font-bold text-bordeaux">
                {card.value}
              </div>
              <p className="text-xs text-bordeaux/50">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair text-xl text-bordeaux">
            Bienvenue dans votre espace d'administration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 font-montserrat text-bordeaux/70">
          <p>
            Depuis ce tableau de bord, vous pouvez gérer l'ensemble de votre
            carte de desserts :
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Plats</strong> : Ajoutez, modifiez ou supprimez vos
              desserts
            </li>
            <li>
              <strong>Catégories</strong> : Organisez vos desserts par
              catégories
            </li>
            <li>
              <strong>Options</strong> : Gérez les sauces, tailles et autres
              personnalisations
            </li>
          </ul>

          {/* Debug info */}
          <div className="mt-6 p-4 bg-beige-darker rounded-lg text-sm">
            <p className="font-semibold mb-2">🔧 Debug Info:</p>
            <ul className="space-y-1 text-xs">
              <li>Plats: {stats.totalPlats}</li>
              <li>Catégories: {stats.totalCategories}</li>
              <li>Types d'options: {stats.totalOptionTypes}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
