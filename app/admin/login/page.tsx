"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    console.log("🔐 [Login] Tentative de connexion avec:", data.email);

    try {
      const supabase = createClient();

      // Vérifier la connexion à Supabase
      console.log(
        "🔧 [Login] URL Supabase:",
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      );
      console.log(
        "🔧 [Login] Anon Key présente:",
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      console.log("🔐 [Login] Résultat auth:", {
        user: authData?.user?.email,
        session: !!authData?.session,
        error: error?.message,
      });

      if (error) {
        console.error("❌ [Login] Erreur:", error.message);
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log(
        "✅ [Login] Connexion réussie! Redirection vers /admin/dashboard",
      );
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error("❌ [Login] Exception:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test de connexion au chargement
  const testConnection = async () => {
    console.log("🧪 [Test] Vérification de la connexion Supabase...");
    const supabase = createClient();

    try {
      const { data, error } = await supabase.from("categories").select("count");
      if (error) {
        console.error("❌ [Test] Erreur de connexion à la BDD:", error.message);
      } else {
        console.log("✅ [Test] Connexion à la BDD OK!");
      }
    } catch (e) {
      console.error("❌ [Test] Exception:", e);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-beige-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-playfair text-3xl text-bordeaux">
            Intemporel
          </CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à l'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          {/* Bouton de test de connexion */}
          <div className="mt-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={testConnection}
            >
              🧪 Tester la connexion BDD
            </Button>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Ouvrez la console (F12) pour voir les logs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
