import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, getImageUrl } from "@/lib/utils";
import {
  DeletePlatButton,
  ToggleAvailabilitySwitch,
} from "./client-components";

async function getPlats() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plats")
    .select(
      `
      *,
      categories (*)
    `,
    )
    .order("name");

  if (error) {
    console.error("Error fetching plats:", error);
    return [];
  }

  // Log pour débugger les images
  console.log("📋 [Plats] Nombre de plats:", data?.length);
  data?.forEach((plat: any) => {
    console.log(`📋 [Plats] ${plat.name} - image:`, plat.image);
  });

  return data || [];
}

export default async function PlatsPage() {
  const plats = await getPlats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-bordeaux">
            Plats
          </h1>
          <p className="mt-1 font-montserrat text-bordeaux/70">
            Gérez vos desserts
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/plats/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau plat
          </Link>
        </Button>
      </div>

      {plats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-bordeaux/70">Aucun plat pour le moment</p>
            <Button asChild className="mt-4">
              <Link href="/admin/plats/new">
                <Plus className="mr-2 h-4 w-4" />
                Créer votre premier plat
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plats.map((plat) => (
            <Card key={plat.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={getImageUrl(plat.image)}
                  alt={plat.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {!plat.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="rounded-full bg-bordeaux px-3 py-1 text-xs font-semibold text-white">
                      Indisponible
                    </span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-playfair text-lg font-semibold text-bordeaux">
                      {plat.name}
                    </h3>
                    <p className="text-xs text-bordeaux/50">
                      {plat.categories?.name}
                    </p>
                  </div>
                  <span className="ml-2 font-playfair font-bold text-bordeaux">
                    {formatPrice(plat.price)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <ToggleAvailabilitySwitch
                    platId={plat.id}
                    available={plat.available}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/plats/${plat.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeletePlatButton platId={plat.id} platName={plat.name} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
