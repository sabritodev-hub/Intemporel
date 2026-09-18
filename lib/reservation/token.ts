import "server-only";
import { randomBytes, createHash } from "crypto";

export function genererToken() {
  const token = randomBytes(32).toString("base64url"); // 43 caractères
  return { token, hash: hasher(token) };
}

export function hasher(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
