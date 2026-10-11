
export async function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function requireAdmin(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)grstudio_session=([^;]+)/);

  if (!match || !env.ADMIN_PASSWORD) {
    return false;
  }

  try {
    const token = decodeURIComponent(match[1]);
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [expires, signature] = parts;
    if (!/^\d+$/.test(expires) || Number(expires) < Date.now()) {
      return false;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.ADMIN_PASSWORD),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signed = new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(expires)
      )
    );

    const expected = Array.from(signed, b =>
      b.toString(16).padStart(2, "0")
    ).join("");

    if (signature.length !== expected.length) return false;

    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    }

    return diff === 0;
  } catch {
    return false;
  }
}
