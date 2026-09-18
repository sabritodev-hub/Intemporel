import "server-only";

export async function verifierTurnstile(token: string, ip: string): Promise<boolean> {
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip,
    }),
  });

  const data = (await r.json()) as { success?: boolean };
  return data.success === true;
}
