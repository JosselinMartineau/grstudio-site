CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL CHECK (kind IN ('image','video','link')),
  media_key TEXT NOT NULL DEFAULT '',
  external_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO site_content(key,value) VALUES
('headline','Создаём визуальные истории'),
('subheadline','Фото, видео и цифровой контент для брендов и людей.'),
('about','GRStudio — независимая студия визуального контента. Здесь можно рассказать о себе, своём подходе и услугах.'),
('contact','hello@grstudio.example');
