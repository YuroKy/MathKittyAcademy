# Math Kitty Academy

Frontend-only local-first PWA для відновлення математичної бази й поступової підготовки до НМТ українською мовою.

## Поточний стан

Поточний робочий вертикальний зріз уже містить:

- оригінальну kawaii дизайн-систему й анімований anime-inspired SVG-маскот із вісьмома настроями;
- onboarding з одним запитанням на крок;
- локальні профілі в IndexedDB;
- захищені локальні маршрути й адаптивну навігацію;
- data-driven маршрут із 91 теми математики для 5–9 класів, упорядкованих за класами,
  алгеброю й геометрією, деталізованих на підтеми та пов’язаних передумовами без
  жорстких блокувань;
- коротке інтерактивне прев’ю кожної теми, доступне у довільному порядку;
- спільний lesson player і повні пілотні уроки «Натуральні числа й арифметика» та «Що таке дріб»;
- prediction cards, групування олівців, fraction bar, покрокові приклади та tap-to-reveal дослідження;
- детерміновані вправи, два рівні підказок, виправлення відповіді та «Не знаю»;
- автозбереження етапу, номера вправи, seeds, стану інтерактивів і кожної спроби;
- транзакційне завершення уроку з mastery, XP, досягненням і review item;
- Open Graph/Twitter preview з окремою анімешною ілюстрацією Мурки;
- базовий PWA manifest, offline shell та керований prompt оновлення;
- unit/component тести та Playwright flows для desktop і mobile.

Маршрути діагностики, повторення, помилок, прогресу, колекції й налаштувань уже зарезервовані, але їхні повні feature flows належать до наступних інкрементів.

## Запуск

Потрібен Node.js 22.12 або новіший.

```bash
corepack npm install
corepack npm run dev
```

Застосунок відкриється за адресою, яку покаже Vite.

## Перевірки

```bash
corepack npm run typecheck
corepack npm run lint
corepack npm run test
corepack npm run test:e2e
corepack npm run build
corepack npm run preview
```

Для першого запуску Playwright може знадобитися:

```bash
corepack npm exec playwright install chromium
```

## Архітектура

- `src/content` — конфігурація продукту, typed curriculum і надалі lesson content.
- `src/domain` — чисті функції генерації, rational arithmetic, mastery, prerequisites і review.
- `src/infrastructure` — версіонована Dexie DB та реалізації repository interfaces.
- `src/features` — route-level екрани й feature-specific UI.
- `src/components` — базові, математичні та mascot-компоненти.
- `src/stores` — короткоживучий application state; persisted learning data лишається в repositories.

UI не звертається до Dexie напряму. Домен не залежить від Vue, Pinia, Dexie або браузерного UI.

## Локальні дані

Основні дані зберігаються в IndexedDB базі `math-kitty-academy`. `localStorage` містить лише ID активного профілю. Жодні навчальні дані не надсилаються на сервер, remote analytics відсутня.

Схема бази має дві версії; друга мігрує старі статуси заблокованих тем у нову модель вільного дослідження. Наступні зміни структури мають додаватися новою `db.version(...)` з атомарною migration-функцією.

## Backup

Версіонований JSON export/import — запланований reliability-інкремент. До його реалізації не слід вручну редагувати IndexedDB: формат таблиць є внутрішнім.

## PWA та offline

`vite-plugin-pwa` кешує application shell, bundled curriculum, CSS, JavaScript і локальні SVG-активи. Оновлення service worker використовує режим `prompt`, щоб не перервати активну вправу. У development service worker увімкнений для перевірки manifest/offline поведінки.

## GitHub Pages

Репозиторій налаштований на автоматичний deployment із гілки `master` через
`.github/workflows/deploy-pages.yml`.

1. У GitHub відкрий `Settings → Pages`.
2. У секції `Build and deployment` обери джерело `GitHub Actions`.
3. Запуш зміни в `master` або запусти workflow вручну з вкладки `Actions`.

Workflow встановлює залежності через `npm ci`, запускає unit/component тести,
збирає застосунок і публікує папку `dist`. Base path обчислюється з назви
репозиторію, тому для цього remote сайт працюватиме за адресою:

```text
https://yuroky.github.io/MathKittyAcademy/
```

На GitHub Pages використовується hash history (`/#/home`), щоб пряме відкриття
вкладених Vue Router маршрутів не повертало статичну сторінку 404. Локальна
розробка продовжує використовувати звичайний history mode.

## Найближчі інкременти

1. Відновлювана адаптивна діагностика й початкові mastery estimates.
2. Повні lesson-сценарії для решти тем на базі вже спільного player.
3. Review-сесія та повний журнал «Заплутані клубочки».
4. Backup validation/import/export, accessibility QA й розширені E2E flows.
