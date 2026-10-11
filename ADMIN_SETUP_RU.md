# Пошаговая установка GRStudio через Android и GitHub

## Перед началом
Не удаляйте старый репозиторий. Если хотите перестраховаться, в GitHub откройте `index.html`, нажмите Edit и сначала скопируйте старый код в заметки. Не отправляйте мне пароль Cloudflare или будущий пароль админки.

## Шаг 1 — загрузите файлы в GitHub
1. Откройте репозиторий `grstudio-site` в GitHub.
2. Откройте `index.html` → Edit (карандаш) → замените содержимое кодом из `index.html` этого архива → Commit changes.
3. Для каждого файла из папки `functions` создайте в корне репозитория путь с тем же именем. В GitHub: Add file → Create new file. В поле имени можно написать, например, `functions/api/content.js`. Вставьте содержимое соответствующего файла из архива и нажмите Commit changes.
4. Повторите для всех файлов внутри `functions`. Пути и имена должны совпадать точно. Папка `functions` должна быть в корне рядом с `index.html`, не внутри другой папки.
5. Создайте `schema.sql` в корне репозитория или оставьте файл из архива для следующего шага. `README_RU.md` и `ADMIN_SETUP_RU.md` можно добавить по желанию.

Файлы для создания в GitHub:
- `functions/_utils.js`
- `functions/api/auth/login.js`
- `functions/api/auth/logout.js`
- `functions/api/auth/status.js`
- `functions/api/content.js`
- `functions/api/projects.js`
- `functions/api/projects/[id].js`
- `functions/api/media/[key].js`

На Android путь можно ввести прямо в поле имени файла; GitHub создаст папки автоматически.

## Шаг 2 — создайте D1
1. Cloudflare Dashboard → Workers & Pages (или Storage & databases) → D1 SQL Database.
2. Create database. Имя: `grstudio-db`.
3. Откройте базу → Console / SQL.
4. Скопируйте весь текст из `schema.sql` и выполните SQL.

## Шаг 3 — создайте R2
1. Cloudflare Dashboard → R2 Object Storage.
2. Create bucket.
3. Имя: `grstudio-media`.

## Шаг 4 — привяжите ресурсы к Pages
Cloudflare → Workers & Pages → Pages project GRStudio → Settings → Bindings → Add:
- D1 database: Variable name `DB`, выберите `grstudio-db`, Save.
- R2 bucket: Variable name `MEDIA`, выберите `grstudio-media`, Save.

Если кнопки или пункты названы немного иначе, ориентируйтесь на D1 database и R2 bucket. После добавления привязок нужен новый deployment.

## Шаг 5 — добавьте секреты
В проекте Cloudflare откройте Settings → Variables and Secrets (название может отличаться).
Добавьте для Production как Secret:
- `ADMIN_PASSWORD` — придумайте уникальный длинный пароль.
- `SESSION_SECRET` — случайная строка длиной минимум 32 символа, например создайте её в менеджере паролей.

Не используйте пароль от GitHub или Cloudflare. Не отправляйте секреты в чат и не записывайте их в файлы сайта.

## Шаг 6 — дождитесь публикации
После коммитов GitHub Cloudflare обычно автоматически запускает deployment. Откройте Deployments и дождитесь статуса Success. Если функции не работают, убедитесь, что проект подключён к GitHub, а не создан как Direct Upload: Pages Functions требуют deployment через Git provider или Wrangler.

## Шаг 7 — проверка
1. Откройте `https://grstudio-site.pages.dev/` — публичный сайт.
2. Откройте `https://grstudio-site.pages.dev/admin` — админка.
3. Введите пароль из `ADMIN_PASSWORD`.
4. Сохраните тестовый заголовок, затем откройте сайт в другом браузере/режиме инкогнито — изменение должно быть видно там тоже.

## Если не работает
- `503`: не добавлены secrets или bindings.
- `500` / database error: не выполнен `schema.sql` или имя binding не `DB`.
- ошибка загрузки: проверьте binding `MEDIA`, размер до 25 MiB и разрешённый тип файла.
- 404 на `/api/...`: проверьте структуру `functions` и что deployment завершился успешно.
