
export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  const respond = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: corsHeaders
    });

  if (!env.DB) {
    return respond({
      error: "Database binding DB is not configured"
    }, 500);
  }

  if (request.method === "GET") {
    try {
      const row = await env.DB
        .prepare("SELECT data FROM site_content WHERE id = 1")
        .first();

      let content = {};

      if (row?.data) {
        try {
          content = JSON.parse(row.data);
        } catch {
          return respond({ error: "Stored content is invalid JSON" }, 500);
        }
      }

      const projects = await env.DB
        .prepare(
          "SELECT id, title, description, media_url, media_type, sort_order FROM projects ORDER BY sort_order, id"
        )
        .all();

      return respond({
        content,
        projects: projects.results || []
      });
    } catch {
      return respond({ error: "Could not read database" }, 500);
    }
  }

  return respond({
    error: "Saving is not enabled yet. Authentication must be configured first."
  }, 405);
}
