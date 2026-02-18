"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Settings, Eye, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { updateSiteConfig } from "@/app/actions";

interface SettingsClientProps {
  initialConfig: Record<string, string>;
}

export default function SettingsClient({ initialConfig }: SettingsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [config, setConfig] = useState({
    show_counter_button: initialConfig.show_counter_button === "true",
    site_name: initialConfig.site_name || "L'Intemporel",
    site_description: initialConfig.site_description || "Bar à Desserts",
  });

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Sauvegarder chaque config
      await updateSiteConfig(
        "show_counter_button",
        config.show_counter_button.toString(),
      );
      await updateSiteConfig("site_name", config.site_name);
      await updateSiteConfig("site_description", config.site_description);

      toast({
        title: "Succès",
        description: "Paramètres enregistrés avec succès",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-bordeaux">
            Paramètres
          </h1>
          <p className="mt-1 font-montserrat text-bordeaux/70">
            Configurez les options de votre site
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informations du site */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-playfair text-xl text-bordeaux">
              <Store className="h-5 w-5" />
              Informations du site
            </CardTitle>
            <CardDescription>
              Personnalisez le nom et la description de votre établissement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nom du site</Label>
              <Input
                id="site_name"
                value={config.site_name}
                onChange={(e) =>
                  setConfig({ ...config, site_name: e.target.value })
                }
                placeholder="Ex: L'Intemporel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Description</Label>
              <Input
                id="site_description"
                value={config.site_description}
                onChange={(e) =>
                  setConfig({ ...config, site_description: e.target.value })
                }
                placeholder="Ex: Bar à Desserts"
              />
            </div>
          </CardContent>
        </Card>

        {/* Options d'affichage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-playfair text-xl text-bordeaux">
              <Eye className="h-5 w-5" />
              Options d'affichage
            </CardTitle>
            <CardDescription>
              Configurez les éléments visibles sur le menu public
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-bordeaux/20 p-4">
              <div className="space-y-1">
                <Label
                  htmlFor="show_counter_button"
                  className="text-base font-medium"
                >
                  Bouton "Voir au comptoir"
                </Label>
                <p className="text-sm text-bordeaux/60">
                  Affiche un bouton d'action sur les fiches produits pour
                  inciter les clients à passer commande
                </p>
              </div>
              <Switch
                id="show_counter_button"
                checked={config.show_counter_button}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, show_counter_button: checked })
                }
              />
            </div>

            {/* Aperçu */}
            <div className="rounded-lg bg-beige-darker/50 p-4">
              <p className="text-sm font-medium text-bordeaux mb-2">Aperçu :</p>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-bordeaux">8,50 €</div>
                {config.show_counter_button ? (
                  <Button size="sm">Voir au comptoir</Button>
                ) : (
                  <span className="text-sm text-bordeaux/50 italic">
                    Bouton masqué
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info supplémentaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-playfair text-xl text-bordeaux">
            <Settings className="h-5 w-5" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-bordeaux/70">
            Les modifications seront appliquées immédiatement sur le site public
            après l'enregistrement. Le bouton "Voir au comptoir" permet
            d'encourager vos clients à passer leur commande au comptoir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
