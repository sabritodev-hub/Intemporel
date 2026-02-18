"use client";

import { useState, useEffect } from "react";
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
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Vérifier la connexion au serveur au chargement
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("categories")
          .select("id")
          .limit(1);
        setServerStatus(error ? "offline" : "online");
      } catch (e) {
        setServerStatus("offline");
      }
    };

    checkServerConnection();
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      router.push("/admin/dashboard");
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

  const getStatusColor = () => {
    switch (serverStatus) {
      case "checking":
        return "bg-yellow-400 animate-pulse";
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case "checking":
        return "Vérification...";
      case "online":
        return "Connexion serveur active";
      case "offline":
        return "Serveur hors ligne";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-beige-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-playfair text-3xl text-bordeaux">
            L'Intemporel
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

          {/* Pastille statut serveur */}
          <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor()}`} />
            <span className="text-xs text-muted-foreground">
              {getStatusText()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
