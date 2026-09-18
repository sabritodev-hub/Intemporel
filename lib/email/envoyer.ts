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
  return new Resend(process.env.RESEND_API_KEY!).emails.send({
    from: process.env.EMAIL_FROM!,
    replyTo: cfg.email_contact || undefined,
    ...opts,
  });
}
