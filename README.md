# Math Kitty Academy

Frontend-only local-first PWA для відновлення математичної бази й поступової підготовки до НМТ українською мовою.

## Поточний стан

Перший робочий вертикальний зріз уже містить:

- оригінальну kawaii дизайн-систему й локальний SVG-маскот;
- onboarding з одним запитанням на крок;
- локальні профілі в IndexedDB;
- захищені локальні маршрути й адаптивну навігацію;
- data-driven карту всіх 15 обов’язкових тем із передумовами;
- повний перший урок «Натуральні числа й арифметика»;
- детерміновані вправи, два рівні підказок, виправлення відповіді та «Не знаю»;
- автозбереження етапу, номера вправи, seeds і кожної спроби;
- транзакційне завершення уроку з mastery, XP, досягненням і review item;
- базовий PWA manifest, offline shell та керований prompt оновлення;
- unit, component і стартовий Playwright test.

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

Схема бази починається з версії 1. Наступні зміни структури мають додаватися новою `db.version(...)` з атомарною migration-функцією.

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
2. Спільний lesson schema/player для наступних тем, починаючи з дробів.
3. Review-сесія та повний журнал «Заплутані клубочки».
4. Backup validation/import/export, accessibility QA й розширені E2E flows.
