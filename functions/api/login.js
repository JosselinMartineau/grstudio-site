
import { json } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return json({ error: "Администратор ещё не настроен" }, 503);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.password !== "string") {
    return json({ error: "Введите пароль" }, 400);
  }

  if (body.password !== env.ADMIN_PASSWORD) {
    return json({ error: "Неверный пароль" }, 401);
  }

  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.ADMIN_PASSWORD),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = Array.from(
    new Uint8Array(await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(expires)
    )),
    b => b.toString(16).padStart(2, "0")
  ).join("");

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": `grstudio_session=${expires}.${signature}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
    }
  });
}
