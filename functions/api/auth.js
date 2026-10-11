
import { json, requireAdmin } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await requireAdmin(request, env);

  return json(
    { authenticated },
    authenticated ? 200 : 401
  );
}
