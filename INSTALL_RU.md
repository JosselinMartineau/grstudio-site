# Установка GRStudio с телефона Android

## Шаг 0 — резервная копия
В GitHub откройте репозиторий `grstudio-site`. Сохраните старый `index.html` отдельно или переименуйте его в `index-backup.html`, прежде чем заменять.

## Шаг 1 — загрузите файлы в GitHub
1. Распакуйте архив на устройстве, если Android позволяет.
2. В GitHub откройте репозиторий `grstudio-site` → `Add file` → `Upload files`.
3. Загрузите `index.html`, `schema.sql`, `README_RU.md`, `INSTALL_RU.md`.
4. Папку `functions` нужно загрузить вместе со всеми вложенными файлами. Если мобильный GitHub не позволяет загрузить папку целиком, создавайте файлы через `Add file` → `Create new file` и используйте путь, например `functions/api/content.js`.
5. Нажмите `Commit changes` в ветку `main`.
6. Проверьте, что `functions` находится в корне репозитория на одном уровне с `index.html`, а не внутри отдельной папки.

## Шаг 2 — создайте D1
1. Cloudflare Dashboard → `Storage & databases` → `D1 SQL Database` → `Create`.
2. Название: `grstudio-db`.
3. Откройте базу → `Console` / `SQL`.
4. Скопируйте весь текст из `schema.sql`, вставьте и выполните.

## Шаг 3 — создайте R2
1. Cloudflare Dashboard → `Storage & databases` → `R2 Object Storage`.
2. Создайте bucket `grstudio-media`.

## Шаг 4 — подключите базы к Pages
Workers & Pages → проект GRStudio → Settings → Bindings → Add:
- `D1 database`: Variable name `DB`, выберите `grstudio-db`, Save.
- `R2 bucket`: Variable name `MEDIA`, выберите `grstudio-media`, Save.

Bindings вступают в силу после следующего deployment.

## Шаг 5 — добавьте секреты
В Settings → Variables and Secrets добавьте для Production два значения типа Secret:
- `ADMIN_PASSWORD` — придумайте длинный уникальный пароль.
- `SESSION_SECRET` — длинная случайная строка минимум 32 символа.

Не используйте пароль от GitHub/Cloudflare. Не вставляйте эти секреты в HTML, GitHub-файлы или чат. Для Preview при необходимости задайте отдельные секреты.

## Шаг 6 — публикация
Сделайте commit в GitHub. Cloudflare Pages обычно запускает deployment автоматически. Откройте Deployments и проверьте статус.

## Шаг 7 — проверка
- Сайт: `https://grstudio-site.pages.dev/`
- Админка: `https://grstudio-site.pages.dev/admin`
- Войдите с `ADMIN_PASSWORD`.
- Попробуйте изменить заголовок, добавить фото/видео, добавить внешнюю ссылку, затем открыть публичный сайт.

## Если не работает
- 404 у `/api/...`: проверьте наличие `functions` в корне репозитория и новый deployment.
- Ошибка о DB/MEDIA: проверьте имена bindings ровно `DB` и `MEDIA`, затем повторно запустите deployment.
- Ошибка про таблицы: повторно выполните `schema.sql` в правильной D1.
- Ошибка входа/настроек: проверьте Production Secrets `ADMIN_PASSWORD` и `SESSION_SECRET`.
- Загрузка медиа ограничена 25 MiB на файл.
