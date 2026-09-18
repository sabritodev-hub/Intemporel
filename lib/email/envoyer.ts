import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { config } from "@/lib/config";

export async function envoyer(opts: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  const cfg = await config();
  const { data, error } = await new Resend(process.env.RESEND_API_KEY!).emails.send({
    from: process.env.EMAIL_FROM!,
    replyTo: cfg.email_contact || undefined,
    ...opts,
  });

  // Le SDK Resend ne rejette JAMAIS la promesse sur une erreur API (clé
  // invalide, domaine non vérifié...) : elle se résout avec { error }.
  // Sans ce contrôle, tout appelant voit un succès silencieux.
  if (error) {
    throw new Error(`Resend: ${error.name} — ${error.message}`);
  }

  return data;
}
