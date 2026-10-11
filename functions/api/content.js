
import { json, requireAdmin } from "../_utils.js";

export async function onRequestGet({ env }) {
  try {
    const row = await env.DB
      .prepare("SELECT data FROM site_content WHERE id = 1")
      .first();

    const projects = await env.DB
      .prepare(
        "SELECT id, title, description, media_url, media_type, sort_order FROM projects ORDER BY sort_order, id"
      )
      .all();

    return json({
      content: row?.data ? JSON.parse(row.data) : {},
      projects: projects.results || []
    });
  } catch {
    return json({ error: "Не удалось прочитать базу данных" }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) {
    return json({ error: "Требуется вход администратора" }, 401);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return json({ error: "Некорректные данные" }, 400);
  }

  try {
    if (body.action === "saveContent") {
      if (!body.content || typeof body.content !== "object" ||
          Array.isArray(body.content)) {
        return json({ error: "Некорректный контент" }, 400);
      }

      await env.DB.prepare(
        "INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP"
      ).bind(JSON.stringify(body.content)).run();

      return json({ ok: true });
    }

    if (body.action === "addProject") {
      if (typeof body.title !== "string" || !body.title.trim()) {
        return json({ error: "Укажи название проекта" }, 400);
      }

      const result = await env.DB.prepare(
        "INSERT INTO projects (title, description, media_url, media_type, sort_order) VALUES (?, ?, ?, ?, ?)"
      ).bind(
        body.title.trim().slice(0, 200),
        String(body.description || "").slice(0, 5000),
        String(body.media_url || "").slice(0, 2000),
        ["image", "video", "link"].includes(body.media_type)
          ? body.media_type : "image",
        Number.isFinite(body.sort_order) ? body.sort_order : 0
      ).run();

      return json({ ok: true, id: result.meta?.last_row_id });
    }

    if (body.action === "updateProject") {
      if (!Number.isInteger(body.id) || body.id < 1 ||
          typeof body.title !== "string" || !body.title.trim()) {
        return json({ error: "Некорректный проект" }, 400);
      }

      await env.DB.prepare(
        "UPDATE projects SET title = ?, description = ?, media_url = ?, media_type = ?, sort_order = ? WHERE id = ?"
      ).bind(
        body.title.trim().slice(0, 200),
        String(body.description || "").slice(0, 5000),
        String(body.media_url || "").slice(0, 2000),
        ["image", "video", "link"].includes(body.media_type)
          ? body.media_type : "image",
        Number.isFinite(body.sort_order) ? body.sort_order : 0,
        body.id
      ).run();

      return json({ ok: true });
    }

    if (body.action === "deleteProject") {
      if (!Number.isInteger(body.id) || body.id < 1) {
        return json({ error: "Некорректный ID проекта" }, 400);
      }

      await env.DB.prepare(
        "DELETE FROM projects WHERE id = ?"
      ).bind(body.id).run();

      return json({ ok: true });
    }

    return json({ error: "Неизвестная команда" }, 400);
  } catch {
    return json({ error: "Ошибка сохранения в базе данных" }, 500);
  }
}
