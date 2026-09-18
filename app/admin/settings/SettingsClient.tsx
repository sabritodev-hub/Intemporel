"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Settings, Eye, Store, Phone, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { normaliser, afficher } from "@/lib/reservation/telephone";

interface SettingsClientProps {
  initialConfig: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsClient({ initialConfig }: SettingsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [config, setConfig] = useState({
    show_counter_button: initialConfig.show_counter_button === "true",
    site_name: initialConfig.site_name || "L'Intemporel",
    site_description: initialConfig.site_description || "Bar à Desserts",
    adresse_restaurant: initialConfig.adresse_restaurant || "",
    email_contact: initialConfig.email_contact || "",
    reservations_actives: initialConfig.reservations_actives !== "false",
    retention_table_min: initialConfig.retention_table_min || "20",
  });

  // Le téléphone est stocké en E.164 mais saisi/affiché au format national.
  const [telephoneInput, setTelephoneInput] = useState(
    initialConfig.telephone_restaurant
      ? afficher(initialConfig.telephone_restaurant)
      : "",
  );
  const [telephoneError, setTelephoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validerTelephone = (valeur: string) => {
    if (valeur.trim() === "") {
      setTelephoneError(null);
      return true;
    }
    if (!normaliser(valeur)) {
      setTelephoneError("Numéro invalide. Exemple : 06 12 34 56 78.");
      return false;
    }
    setTelephoneError(null);
    return true;
  };

  const validerEmail = (valeur: string) => {
    if (valeur.trim() === "") {
      setEmailError(null);
      return true;
    }
    if (!EMAIL_RE.test(valeur.trim())) {
      setEmailError("Adresse email invalide.");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSave = async () => {
    const telephoneOk = validerTelephone(telephoneInput);
    const emailOk = validerEmail(config.email_contact);

    if (!telephoneOk || !emailOk) {
      toast({
        title: "Champs invalides",
        description: "Corrigez les champs en erreur avant d'enregistrer.",
        variant: "destructive",
      });
      return;
    }

    const retention = parseInt(config.retention_table_min, 10);
    if (Number.isNaN(retention) || retention < 0 || retention > 60) {
      toast({
        title: "Champ invalide",
        description: "La durée de rétention de table doit être comprise entre 0 et 60 minutes.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const telephoneE164 = telephoneInput.trim() === "" ? "" : normaliser(telephoneInput) || "";

      // Sauvegarder chaque config
      await updateSiteConfig(
        "show_counter_button",
        config.show_counter_button.toString(),
      );
      await updateSiteConfig("site_name", config.site_name);
      await updateSiteConfig("site_description", config.site_description);
      await updateSiteConfig("telephone_restaurant", telephoneE164);
      await updateSiteConfig("adresse_restaurant", config.adresse_restaurant);
      await updateSiteConfig("email_contact", config.email_contact);
      await updateSiteConfig(
        "reservations_actives",
        config.reservations_actives.toString(),
      );
      await updateSiteConfig("retention_table_min", retention.toString());

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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coordonnées du restaurant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-playfair text-xl text-bordeaux">
              <Phone className="h-5 w-5" />
              Coordonnées du restaurant
            </CardTitle>
            <CardDescription>
              Ces informations apparaissent sur le site, dans les emails et les
              pages légales. Une modification ici se propage partout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telephone_restaurant">Téléphone</Label>
              <Input
                id="telephone_restaurant"
                type="tel"
                value={telephoneInput}
                onChange={(e) => setTelephoneInput(e.target.value)}
                onBlur={(e) => validerTelephone(e.target.value)}
                placeholder="06 12 34 56 78"
                aria-invalid={!!telephoneError}
                aria-describedby={telephoneError ? "telephone_restaurant-erreur" : undefined}
              />
              {telephoneError ? (
                <p
                  id="telephone_restaurant-erreur"
                  className="text-[11px] font-semibold text-bordeaux"
                >
                  {telephoneError}
                </p>
              ) : (
                <p className="text-sm text-bordeaux/60">
                  Affiché pour les groupes de plus de 12 personnes et les
                  annulations de dernière minute
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse_restaurant">Adresse</Label>
              <Textarea
                id="adresse_restaurant"
                rows={2}
                value={config.adresse_restaurant}
                onChange={(e) =>
                  setConfig({ ...config, adresse_restaurant: e.target.value })
                }
                placeholder="12 rue des Arts, 69000 Lyon"
              />
              <p className="text-sm text-bordeaux/60">
                Reprise dans les emails et les pages légales
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_contact">Email de contact</Label>
              <Input
                id="email_contact"
                type="email"
                value={config.email_contact}
                onChange={(e) =>
                  setConfig({ ...config, email_contact: e.target.value })
                }
                onBlur={(e) => validerEmail(e.target.value)}
                placeholder="contact@votre-domaine.fr"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email_contact-erreur" : undefined}
              />
              {emailError ? (
                <p
                  id="email_contact-erreur"
                  className="text-[11px] font-semibold text-bordeaux"
                >
                  {emailError}
                </p>
              ) : (
                <p className="text-sm text-bordeaux/60">
                  Adresse de réponse des emails de réservation
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Réservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-playfair text-xl text-bordeaux">
              <CalendarCheck className="h-5 w-5" />
              Réservations
            </CardTitle>
            <CardDescription>
              Contrôlez l'ouverture des réservations en ligne du brunch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-bordeaux/20 p-4">
              <div className="space-y-1">
                <Label
                  htmlFor="reservations_actives"
                  className="text-base font-medium"
                >
                  Réservation en ligne
                </Label>
                <p className="text-sm text-bordeaux/60">
                  Désactivée, le bouton Réserver disparaît et la page affiche
                  le téléphone du restaurant
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-bordeaux/70">
                  {config.reservations_actives ? "Activée" : "Désactivée"}
                </span>
                <Switch
                  id="reservations_actives"
                  checked={config.reservations_actives}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, reservations_actives: checked })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retention_table_min">
                Table gardée (minutes)
              </Label>
              <Input
                id="retention_table_min"
                type="number"
                min={0}
                max={60}
                value={config.retention_table_min}
                onChange={(e) =>
                  setConfig({ ...config, retention_table_min: e.target.value })
                }
              />
              <p className="text-sm text-bordeaux/60">
                Reprise à l'article 3 des conditions de réservation
              </p>
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
