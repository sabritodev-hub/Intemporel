import { z } from "zod";
import { normaliser } from "./telephone";

// Le honeypot n'est volontairement PAS dans ce schéma : sa détection doit
// renvoyer un faux succès, jamais une erreur de validation qui le révélerait.
export const reservationSchema = z.object({
  creneauId: z.string().uuid(),
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(80, "Le nom est trop long."),
  email: z.string().trim().email("Adresse email incomplète."),
  telephone: z
    .string()
    .trim()
    .refine((v) => !!normaliser(v), "Numéro de téléphone invalide."),
  couverts: z.coerce
    .number()
    .int()
    .min(1, "Au moins 1 personne.")
    .max(12, "Au-delà de 12 personnes, contactez-nous par téléphone."),
  consentement: z
    .boolean()
    .refine((v) => v === true, "Merci d'accepter la politique de confidentialité."),
  turnstileToken: z.string().min(1, "Vérification anti-robot requise."),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
