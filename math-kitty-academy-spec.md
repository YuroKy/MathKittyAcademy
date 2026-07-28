# Math Kitty Academy

## Product and Technical Specification

**Document status:** Ready for implementation  
**Target:** Frontend-only local-first PWA  
**Primary user:** One Ukrainian-speaking student preparing for the mathematics NMT from a weak starting level  
**Target device:** Mobile phone first, desktop/tablet supported  
**Language:** Ukrainian  

---

## 1. Product summary

Math Kitty Academy is a kawaii mathematics learning application that helps a student rebuild mathematics knowledge from the foundations and gradually prepare for NMT-style tasks.

The student currently struggles with basic fractions and percentages and has more than six months before the exam. The product must therefore teach prerequisite knowledge instead of immediately presenting difficult exam tasks.

The application is:

- completely frontend-only;
- installable as a PWA;
- usable offline after the initial load;
- based on a local student profile;
- capable of saving progress between sessions;
- designed as a guided learning path rather than a collection of unrelated tests;
- visually inspired by Japanese kawaii stationery and soft cat-themed aesthetics.

The product must use an original mascot and original visual assets. It must not use the Hello Kitty name, logo, illustrations, or copied character design.

### Working title

**Math Kitty Academy**

The name should be isolated in configuration so it can easily be replaced later.

---

## 2. Product goals

### Primary goal

Help the student consistently study mathematics in short sessions and progress from basic arithmetic to NMT-level practice.

### Supporting goals

- Find and close foundational knowledge gaps.
- Explain concepts using simple language and visual examples.
- Teach one small concept at a time.
- Identify the likely reason behind mistakes.
- Regularly repeat previously learned material.
- Make progress visible and emotionally rewarding.
- Work without a backend, server account, or permanent internet connection.
- Avoid making a weak student feel punished or humiliated.

### Success criteria

The first version is successful if the student can:

1. Create a local profile.
2. Complete a short diagnostic.
3. Receive a recommended learning path.
4. Complete lessons and practice exercises.
5. Close the application and continue later without losing progress.
6. See what has been learned and what requires improvement.
7. Export and restore all progress.
8. Install the application and use completed/downloaded content offline.

---

## 3. Product principles

### 3.1 One obvious next action

The dashboard must always clearly show what the student should do next. The main action should normally be `Продовжити навчання`.

### 3.2 Foundation before exam simulation

Advanced topics remain visible on the learning map but are not recommended until their prerequisites are sufficiently mastered.

### 3.3 Short learning sessions

A standard session should take approximately 10–15 minutes and contain:

1. One short explanation.
2. One guided example.
3. Several practice tasks.
4. One summary.

### 3.4 Mistakes are learning data

Never show only `Неправильно`. Explain the likely mistake and provide a useful next action.

### 3.5 Progress without harsh punishment

Do not remove XP. Do not reset all progress after one missed day. Do not use shame-based messages.

### 3.6 Mobile-first

Every important action must work comfortably on a phone using touch input.

### 3.7 Content separated from application logic

Lessons, exercises, curriculum dependencies, achievements, and UI text should be data-driven and separated from reusable learning-engine code.

---

## 4. Scope

## 4.1 MVP scope

The MVP must include:

- local profile creation;
- optional local PIN;
- onboarding;
- baseline diagnostic;
- personal learning path;
- curriculum map;
- lesson player;
- guided examples;
- generated and static exercises;
- answer validation;
- contextual hints;
- simple step-by-step explanations;
- mastery tracking;
- spaced review queue;
- mistake journal;
- XP and levels;
- gentle learning streak;
- achievements and collectible stickers;
- student progress dashboard;
- local data persistence using IndexedDB;
- JSON backup export and import;
- offline-capable PWA;
- responsive kawaii UI;
- automated tests for important domain logic.

### Required MVP curriculum

The first implementation must contain complete, usable content for:

1. Natural numbers and arithmetic operations.
2. Order of operations.
3. Negative numbers.
4. Divisibility basics.
5. Ordinary fractions: meaning and representation.
6. Comparing fractions.
7. Equivalent fractions and simplification.
8. Adding and subtracting fractions with equal denominators.
9. Adding and subtracting fractions with different denominators.
10. Multiplying and dividing fractions.
11. Decimal fractions.
12. Converting ordinary and decimal fractions.
13. Percentages.
14. Ratios and proportions.
15. Simple linear equations.

Each topic must contain at least:

- a concise explanation;
- one visual or concrete example;
- one guided example;
- at least two exercise templates or a sufficient static exercise set;
- at least two hint levels;
- a solution explanation;
- mastery rules;
- prerequisite metadata.

## 4.2 Post-MVP scope

Design the architecture so the following can be added later:

- full algebra curriculum;
- full geometry curriculum;
- NMT topic practice;
- timed mixed tests;
- complete NMT simulations;
- parent/brother dashboard on a separate device;
- cloud synchronization;
- real email or social login;
- AI tutor;
- remote content updates;
- additional profile customization;
- reminder notifications.

## 4.3 Explicit non-goals for MVP

Do not implement:

- a backend;
- server-side authentication;
- Google login;
- payments;
- multiplayer or leaderboards;
- chat;
- remote brother/parent monitoring;
- an API key stored in frontend code;
- an LLM integration;
- a content management system;
- exact NMT score prediction;
- official Hello Kitty assets or branding.

---

## 5. Target user and learning context

### Student profile

- Ukrainian-speaking.
- Preparing for the mathematics NMT.
- More than six months remain before the exam.
- Has major gaps in foundational mathematics.
- Struggles with fractions and percentages.
- Enjoys Hello Kitty and kawaii visual design.
- May have low confidence and limited tolerance for long explanations.

### Product response

The application must:

- use simple Ukrainian;
- avoid unexplained terminology;
- show concrete examples before formal notation;
- split complex operations into individual steps;
- celebrate consistency and improvement;
- use a warm, playful tone without speaking to the student like a small child.

---

## 6. Core user journey

1. The student opens the application.
2. The student creates a local profile.
3. The student selects a mascot/avatar and daily study goal.
4. The application explains that the diagnostic is not an exam.
5. The student completes a short adaptive diagnostic.
6. The application builds a knowledge-gap map.
7. The dashboard recommends the first lesson.
8. The student completes a 10–15 minute session.
9. Results update mastery, XP, review queue, streak, and mistake journal.
10. The student returns later and continues from the saved state.

---

## 7. Information architecture and routes

Use route-level code splitting where practical.

| Route | Screen | Purpose |
| --- | --- | --- |
| `/` | App entry | Redirect to onboarding, profile selection, or dashboard |
| `/welcome` | Welcome | Product introduction and local profile entry |
| `/profiles` | Profiles | Select, create, edit, export, or remove a local profile |
| `/onboarding` | Onboarding | Configure goal, exam date, schedule, and mascot |
| `/diagnostic` | Diagnostic | Run initial or repeat diagnostic |
| `/home` | Dashboard | Show the recommended next action and daily progress |
| `/learn/:topicId` | Lesson player | Explanation, guided example, practice, and summary |
| `/review` | Review session | Practice scheduled material |
| `/map` | Learning map | Show topics, dependencies, and mastery |
| `/mistakes` | Mistake journal | Review grouped errors |
| `/progress` | Progress | Show subject and activity statistics |
| `/collection` | Collection | Mascot, stickers, achievements, and room decoration |
| `/settings` | Settings | Profile, backup, accessibility, sound, and data controls |

Protected local routes must redirect to profile selection if no active profile exists.

---

## 8. Screen requirements

## 8.1 Welcome and profile selection

### Required

- original cat mascot;
- title and one-sentence value proposition;
- `Створити профіль` primary button;
- existing local profiles, if any;
- clear message that progress is stored on this device;
- backup restoration entry point.

### Local profile fields

- display name;
- generated ID;
- mascot/avatar ID;
- optional 4–6 digit PIN;
- target exam date;
- optional target score;
- daily goal in minutes;
- preferred study days.

The PIN is only a convenience/privacy barrier. The UI must not claim that it provides strong security.

## 8.2 Onboarding

Use one question per screen:

1. Student name.
2. Approximate exam date.
3. Desired weekly frequency.
4. Daily session length: 10, 15, or 20 minutes.
5. Mascot/avatar choice.
6. Invitation to start the diagnostic.

Allow backward navigation without losing answers.

## 8.3 Diagnostic

### Requirements

- explain that it is used to choose a starting point;
- begin with easy tasks;
- contain approximately 12–20 tasks;
- take approximately 10–15 minutes;
- cover prerequisite skill groups;
- support `Не знаю`;
- show progress without emphasizing a numeric score;
- avoid a countdown timer;
- save after every answer;
- be resumable after application reload.

### Initial diagnostic skill groups

- basic arithmetic;
- order of operations;
- negative numbers;
- fractions;
- decimals;
- percentages;
- proportions;
- simple equations;
- elementary geometry awareness.

### Diagnostic result

Show three categories:

- `Уже вмію`;
- `Треба повторити`;
- `Починаємо з основ`.

The result must generate topic mastery estimates and a recommended starting topic.

## 8.4 Dashboard

The dashboard must prioritize one large card:

- next recommended activity;
- expected duration;
- reason for recommendation;
- primary start/continue button.

Secondary information:

- daily goal progress;
- current level and XP;
- learning streak;
- due review count;
- recent achievement;
- mascot reaction.

Do not overload this screen with charts.

## 8.5 Learning map

Display the curriculum as a vertical journey through themed academy rooms.

Topic states:

- locked;
- available;
- in progress;
- review needed;
- mastered.

Selecting a locked topic must show its prerequisites. It must not produce a generic disabled-button experience.

## 8.6 Lesson player

Each lesson is a state machine with these stages:

1. Introduction.
2. Concept explanation.
3. Visual example.
4. Guided example.
5. Supported practice.
6. Independent practice.
7. Mini challenge.
8. Summary.

### Interaction rules

- show one concept or task at a time;
- persist current stage and exercise after each action;
- support keyboard and touch;
- render mathematical expressions using KaTeX;
- never require manual LaTeX input from the student;
- provide `Підказка`;
- provide `Поясни простіше`;
- provide `Не знаю`;
- allow an answer to be corrected after feedback;
- show the correct solution before ending a failed task.

## 8.7 Review session

Review sessions must:

- use previously completed material;
- prioritize weak or overdue skills;
- include 3–10 exercises;
- mix recognition and solution tasks;
- update mastery independently from the original lesson;
- show a brief result summary.

## 8.8 Mistake journal

Use the user-facing name **Заплутані клубочки**.

Group mistakes by:

- topic;
- error type;
- date;
- unresolved/resolved state.

Each entry should show:

- original task;
- submitted answer;
- correct answer;
- likely error type;
- short explanation;
- `Спробувати схоже завдання` action.

## 8.9 Progress screen

Show:

- completed sessions;
- studied minutes;
- mastered topics;
- current foundation progress;
- mastery by curriculum group;
- review accuracy;
- common error types;
- weekly activity.

Avoid unsupported claims such as an exact future NMT score.

## 8.10 Collection

Include:

- original mascot;
- unlocked stickers;
- achievement badges;
- simple room/desk decorations;
- cosmetic rewards tied to learning milestones.

Cosmetics must not block educational functionality.

## 8.11 Settings

Include:

- edit local profile;
- change daily goal;
- sound toggle;
- reduced motion toggle;
- high-contrast option;
- export backup;
- import backup;
- reset profile progress;
- delete profile;
- application version and data schema version.

Reset and deletion require explicit confirmation and must clearly state the affected profile.

---

## 9. Learning model

## 9.1 Topic dependency graph

Each topic defines prerequisites. Example:

```text
basic-arithmetic
  -> order-of-operations
  -> negative-numbers

basic-arithmetic
  -> fraction-meaning
  -> equivalent-fractions
  -> fraction-addition
  -> fraction-multiplication

fractions + decimals
  -> percentages
  -> ratios-and-proportions

order-of-operations + negative-numbers
  -> simple-linear-equations
```

The curriculum must be represented as data, not hardcoded navigation conditions.

## 9.2 Mastery

Track mastery per skill, not only per lesson.

Suggested mastery value: integer from 0 to 100.

Initial diagnostic classification:

- 0–24: foundation required;
- 25–59: learning/in progress;
- 60–79: practice required;
- 80–100: mastered.

These thresholds must be configurable.

### Mastery update principles

- correct independent answers increase mastery most;
- correct answers after hints increase mastery less;
- guided examples provide only a small increase;
- repeated mistakes reduce confidence in mastery but never below zero;
- recent review results matter more than very old results;
- a topic becomes mastered only after successful independent practice;
- mastery must not depend on speed during foundational learning.

Implement mastery calculation as a pure, tested domain function.

## 9.3 Review scheduling

Use a simple deterministic schedule for MVP:

- first review: next day;
- second review: after 3 days;
- third review: after 7 days;
- later review: after 14 days;
- failed review: return the skill to the next-day queue.

Intervals must be configurable.

## 9.4 Error taxonomy

Supported initial error types:

- `conceptMisunderstanding`;
- `calculationError`;
- `signError`;
- `operationOrderError`;
- `fractionRuleError`;
- `conditionMisread`;
- `inputMistake`;
- `unknown`.

Use deterministic rules when possible. If the error cannot be inferred reliably, classify it as `unknown` instead of inventing a confident explanation.

## 9.5 Exercise difficulty

Use difficulty levels 1–5:

1. recognition or direct one-step operation;
2. one-step calculation;
3. several familiar steps;
4. mixed concept application;
5. NMT-like or unfamiliar context.

The MVP foundational curriculum should primarily use levels 1–3.

---

## 10. Exercise architecture

Support both static exercises and deterministic generated exercises.

Each generated exercise must contain:

- template ID;
- seed;
- topic/skill IDs;
- difficulty;
- rendered prompt;
- expected answer specification;
- validation strategy;
- hint builder;
- solution-step builder;
- error-classification rules.

### Suggested type model

```ts
type ExerciseKind =
  | 'singleChoice'
  | 'multipleChoice'
  | 'numericInput'
  | 'fractionInput'
  | 'stepByStep'
  | 'matching';

interface ExerciseInstance {
  id: string;
  templateId: string;
  seed: string;
  topicId: string;
  skillIds: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  kind: ExerciseKind;
  prompt: ExercisePrompt;
  expectedAnswer: AnswerSpec;
  hints: Hint[];
  solutionSteps: SolutionStep[];
}
```

### Determinism requirement

Given the same template ID and seed, the generator must produce the same task. This is necessary for:

- resuming an interrupted lesson;
- displaying old mistakes;
- reproducing bugs;
- unit testing.

### Validation requirements

- accept equivalent simplified and unsimplified fractions where appropriate;
- normalize whitespace and decimal separators;
- support comma and dot as decimal separators;
- never use JavaScript floating-point equality directly for mathematical comparison;
- use rational arithmetic for fraction tasks;
- define tolerance explicitly for decimal answers where required;
- validate intermediate steps separately in guided exercises.

---

## 11. Gamification

## 11.1 XP and levels

Award XP for:

- completing a lesson;
- completing a review;
- correcting a previous mistake;
- mastering a topic;
- meeting a daily goal.

Do not remove XP for incorrect answers.

XP values must be configured centrally.

## 11.2 Streak

A streak day is completed when the daily minimum activity is met.

Requirements:

- one missed day must not create shame-oriented messaging;
- support one configurable streak-freeze token;
- display the next achievable action;
- calculate dates in the user's local timezone;
- test behavior around midnight and daylight-saving changes.

## 11.3 Achievements

Initial achievements:

- first lesson completed;
- first topic mastered;
- three study days;
- seven-day streak;
- first corrected mistake;
- ten corrected mistakes;
- first review completed;
- five topics mastered.

## 11.4 Tone examples

Good:

- `Ще один крок — і тема буде засвоєна.`
- `Помилка знайшлася. Тепер розплутаємо її разом.`
- `Сьогодні достатньо 10 хвилин.`

Avoid:

- `Це було дуже легко!`
- `Ти знову помилився.`
- `Спробуй уважніше.`
- excessive baby talk.

---

## 12. Visual design specification

## 12.1 Direction

Create an original premium kawaii learning interface inspired by Japanese stationery, cozy character applications, stickers, bows, hearts, stars, and soft cat aesthetics.

Do not copy protected character proportions, facial features, artwork, logos, product patterns, or the Hello Kitty name.

## 12.2 Design qualities

- warm;
- comforting;
- playful;
- clean;
- highly readable;
- not visually noisy;
- not overly childish;
- focused on one primary action.

## 12.3 Suggested color tokens

All final colors must meet accessibility requirements.

```css
:root {
  --color-bg: #fff8fb;
  --color-surface: #ffffff;
  --color-surface-soft: #fff0f6;
  --color-primary: #ec6f9e;
  --color-primary-hover: #d95789;
  --color-primary-soft: #ffd7e6;
  --color-secondary: #8fc9e8;
  --color-accent: #f6c85f;
  --color-success: #68b893;
  --color-warning: #e6a84d;
  --color-danger: #d95768;
  --color-text: #3f3440;
  --color-text-muted: #756a76;
  --color-border: #efd8e2;
}
```

Do not use light pink body text on a white background.

## 12.4 Typography

- UI: `Manrope`, with a system sans-serif fallback.
- Mathematics: KaTeX default math fonts.
- Large headings should remain compact on small screens.
- Minimum body font size: 16 px.

## 12.5 Shape language

- rounded cards;
- soft borders;
- limited soft shadows;
- pill buttons only where appropriate;
- large touch targets;
- sticker-like decorations used sparingly;
- a consistent bow/heart/star icon vocabulary.

## 12.6 Mascot

Create an original white cat mascot with:

- a distinct silhouette;
- an accessory that is not a direct copy of Hello Kitty's red bow placement/design;
- several simple emotional states;
- scalable SVG or lightweight local assets;
- no dependency on external image URLs.

Required states:

- neutral;
- encouraging;
- celebrating;
- thinking;
- gently reacting to a mistake;
- sleeping/offline.

## 12.7 Motion

- short and subtle;
- celebrate meaningful milestones;
- never delay answering;
- avoid constant floating elements;
- respect `prefers-reduced-motion`;
- provide a reduced-motion setting.

## 12.8 Responsive behavior

Mobile:

- bottom navigation;
- one-column content;
- sticky primary action where useful;
- minimum touch target of 44 × 44 px.

Desktop/tablet:

- optional left navigation;
- centered learning content;
- maximum readable content width;
- no stretched full-width task text.

---

## 13. Accessibility

The application must:

- meet WCAG AA contrast for essential text and controls;
- be navigable with a keyboard;
- show visible focus styles;
- provide labels for icon-only controls;
- avoid communicating correctness using color alone;
- support reduced motion;
- support browser zoom to 200%;
- not require drag-and-drop as the only interaction;
- announce exercise feedback using appropriate live regions;
- preserve focus logically when moving to the next exercise;
- use semantic HTML before ARIA.

---

## 14. Technical architecture

## 14.1 Required stack

- Vue 3;
- TypeScript with strict mode;
- Vite;
- Vue Router;
- Pinia;
- IndexedDB;
- Dexie.js;
- KaTeX;
- PWA integration using `vite-plugin-pwa`;
- Vitest;
- Vue Test Utils;
- Playwright for critical end-to-end flows;
- ESLint;
- Prettier.

Avoid adding a large component framework unless it materially improves the result. Prefer a small custom design system using CSS variables and reusable Vue components.

## 14.2 Architectural layers

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── App.vue
├── assets/
├── components/
│   ├── base/
│   ├── math/
│   └── mascot/
├── content/
│   ├── curriculum/
│   ├── lessons/
│   ├── exercises/
│   ├── achievements/
│   └── localization/
├── domain/
│   ├── diagnostic/
│   ├── learning/
│   ├── mastery/
│   ├── review/
│   ├── gamification/
│   └── backup/
├── features/
│   ├── profiles/
│   ├── onboarding/
│   ├── diagnostic/
│   ├── dashboard/
│   ├── lesson-player/
│   ├── review/
│   ├── learning-map/
│   ├── mistakes/
│   ├── progress/
│   ├── collection/
│   └── settings/
├── infrastructure/
│   ├── db/
│   ├── repositories/
│   ├── backup/
│   └── pwa/
├── stores/
├── styles/
├── types/
└── utils/
```

## 14.3 Dependency direction

- UI features may call domain services and repository interfaces.
- Domain code must not depend on Vue, Pinia, Dexie, or browser UI APIs.
- IndexedDB implementations live in infrastructure.
- Learning content depends on domain schemas, not on UI components.
- Exercise generators and validators should be pure functions where possible.

## 14.4 Repository abstraction

Use repository interfaces so IndexedDB can later be supplemented with cloud synchronization.

Suggested repositories:

- `ProfileRepository`;
- `LearningProgressRepository`;
- `SessionRepository`;
- `MistakeRepository`;
- `ReviewRepository`;
- `AchievementRepository`;
- `SettingsRepository`.

Do not build a fake HTTP API.

---

## 15. Data model

The exact implementation may evolve, but all entities require schema validation and migration support.

```ts
interface StudentProfile {
  id: string;
  name: string;
  avatarId: string;
  pinHash?: string;
  examDate?: string;
  targetScore?: number;
  dailyGoalMinutes: 10 | 15 | 20;
  preferredStudyDays: number[];
  createdAt: string;
  updatedAt: string;
}

interface TopicProgress {
  profileId: string;
  topicId: string;
  mastery: number;
  status: 'locked' | 'available' | 'inProgress' | 'reviewNeeded' | 'mastered';
  attempts: number;
  independentCorrect: number;
  lastPracticedAt?: string;
  masteredAt?: string;
}

interface SkillProgress {
  profileId: string;
  skillId: string;
  mastery: number;
  attempts: number;
  correctAttempts: number;
  hintedCorrectAttempts: number;
  lastPracticedAt?: string;
}

interface LearningSession {
  id: string;
  profileId: string;
  type: 'diagnostic' | 'lesson' | 'review';
  topicId?: string;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  currentStage?: string;
  currentExerciseIndex?: number;
  exerciseSeeds: string[];
  earnedXp: number;
}

interface ExerciseAttempt {
  id: string;
  profileId: string;
  sessionId: string;
  exerciseId: string;
  templateId: string;
  seed: string;
  skillIds: string[];
  submittedAnswer: unknown;
  normalizedAnswer: unknown;
  isCorrect: boolean;
  hintLevelUsed: number;
  errorType?: ErrorType;
  createdAt: string;
}

interface ReviewItem {
  id: string;
  profileId: string;
  skillId: string;
  intervalStep: number;
  dueAt: string;
  lastResult?: 'correct' | 'incorrect';
}

interface MistakeRecord {
  id: string;
  profileId: string;
  attemptId: string;
  topicId: string;
  skillIds: string[];
  errorType: ErrorType;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

interface GamificationState {
  profileId: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastGoalDate?: string;
  streakFreezes: number;
  unlockedAchievementIds: string[];
  unlockedCosmeticIds: string[];
}
```

Store dates as ISO 8601 strings. Convert them to local calendar dates only through shared date utilities.

---

## 16. Local persistence

## 16.1 IndexedDB

Use Dexie.js with:

- explicit schema versions;
- migration functions;
- one database for the application;
- profile IDs on all user-owned data;
- transactions for session completion;
- safe handling of quota and write failures.

Do not use `localStorage` for progress, attempts, lessons, or backups.

`localStorage` may only store:

- active profile ID;
- theme/preload hints;
- small non-critical UI preferences.

## 16.2 Autosave

Save:

- after every diagnostic answer;
- after every exercise attempt;
- after changing a lesson stage;
- after completing a session;
- after changing settings.

Reloading during a lesson must restore the current lesson, exercise seed, and stage.

## 16.3 Backup export

Export one JSON file containing:

- backup format version;
- application version;
- export timestamp;
- profiles;
- all progress and sessions;
- mistakes and review queue;
- achievements and settings;
- content compatibility metadata.

Suggested filename:

```text
math-kitty-backup-YYYY-MM-DD.json
```

## 16.4 Backup import

Before import:

- validate JSON structure;
- validate supported backup version;
- show included profiles and export date;
- explain whether data will be merged or replaced.

MVP may support `replace all local data` only, provided the user receives a clear confirmation and an automatic pre-import backup is offered.

Never partially import invalid data.

---

## 17. PWA and offline behavior

The application must:

- be installable;
- include a valid manifest;
- cache the application shell;
- cache bundled curriculum and local visual assets;
- work offline after the first successful load;
- show a non-blocking offline indicator;
- preserve writes while offline because all primary writes are local;
- handle application updates without silently destroying an active session.

Do not cache third-party CDN assets. Bundle fonts/assets locally or use reliable fallbacks.

When a new service-worker version is ready:

- show a friendly update prompt;
- allow the student to finish the current exercise;
- activate the update after confirmation or when no session is active.

---

## 18. State management

Use Pinia for application/session state, not as the source of truth for persisted learning data.

Suggested stores:

- `useAppStore`;
- `useProfileStore`;
- `useDiagnosticStore`;
- `useLessonSessionStore`;
- `useProgressStore`;
- `useGamificationStore`;
- `useSettingsStore`.

Repositories remain responsible for persistence.

Avoid one global store containing the entire application.

---

## 19. Content format

Curriculum and lessons should be authored as typed TypeScript or validated JSON.

Suggested topic structure:

```ts
interface CurriculumTopic {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  groupId: string;
  prerequisiteTopicIds: string[];
  skillIds: string[];
  lessonIds: string[];
  order: number;
  estimatedMinutes: number;
}
```

Suggested lesson blocks:

```ts
type LessonBlock =
  | ExplanationBlock
  | MathExampleBlock
  | VisualFractionBlock
  | GuidedExerciseBlock
  | PracticeSetBlock
  | MiniChallengeBlock
  | SummaryBlock;
```

Do not embed arbitrary executable HTML in learning content.

---

## 20. Error handling

Provide dedicated friendly states for:

- IndexedDB unavailable;
- failed local write;
- storage quota exceeded;
- invalid backup;
- unsupported backup version;
- corrupted active session;
- missing lesson content;
- PWA update failure.

The application must not pretend a save succeeded if it failed.

For recoverable session corruption:

- preserve the profile and completed progress;
- offer to restart only the affected session;
- log useful technical details in development mode.

---

## 21. Privacy and security

- All primary user data stays on the device.
- Explain this clearly during onboarding and backup.
- Never send progress to analytics or external services in MVP.
- Do not include third-party trackers.
- Do not store plaintext PIN values.
- If a PIN is implemented, use Web Crypto and clearly describe it as local casual protection.
- Never place secrets or private API keys in the frontend.
- Sanitize imported backup data and validate it against a schema.

---

## 22. Testing strategy

## 22.1 Unit tests

Required for:

- fraction arithmetic and normalization;
- decimal comparison;
- exercise generators;
- deterministic seeds;
- answer validators;
- mastery calculation;
- prerequisite unlocking;
- diagnostic classification;
- review scheduling;
- streak calculation;
- backup schema validation;
- database migrations.

## 22.2 Component tests

Required for:

- math input;
- fraction input;
- exercise feedback;
- hint display;
- lesson navigation;
- locked-topic explanation;
- backup confirmation UI.

## 22.3 End-to-end tests

Critical flows:

1. Create a local profile and finish onboarding.
2. Start the diagnostic, reload, and resume it.
3. Complete the diagnostic and receive a starting topic.
4. Start a lesson, answer tasks, reload, and resume.
5. Complete a lesson and verify progress/XP/review creation.
6. Export a backup, reset local data, and restore the backup.
7. Installable/offline application shell check.
8. Use the core lesson flow with keyboard navigation.

---

## 23. Performance requirements

- Optimize for mid-range mobile devices.
- Avoid downloading the entire future curriculum if code splitting can prevent it.
- Keep first meaningful UI responsive and lightweight.
- Lazy-load non-essential routes and collection assets.
- Use local SVG/CSS decorations instead of large raster backgrounds.
- Avoid animation-driven layout shifts.
- Do not block the lesson UI while calculating simple domain results.

---

## 24. Analytics without tracking

MVP analytics are local and visible only to the student:

- sessions completed;
- minutes studied;
- accuracy;
- mastery changes;
- common error types;
- review completion;
- activity by local date.

Do not add Google Analytics, Meta Pixel, session recording, or remote telemetry.

Development-only error logging may use the browser console.

---

## 25. Acceptance criteria

The MVP is ready when all of the following are true:

### Product

- A new user can understand the product and begin within two minutes.
- The diagnostic recommends an appropriate foundational starting point.
- The dashboard always presents a clear next learning action.
- At least 15 required foundational topics are complete and usable.
- Every topic includes explanation, guided practice, independent practice, hints, and a summary.
- Mistakes can be revisited through `Заплутані клубочки`.
- Progress, review, XP, and achievements update correctly.

### Persistence

- All important actions are saved in IndexedDB.
- A browser reload does not lose the active diagnostic or lesson.
- Backup export includes all profiles and progress.
- A valid backup can restore the application state.
- Invalid backups do not modify existing local data.

### Offline/PWA

- The application is installable.
- The application opens and completed/bundled lessons work offline after initial load.
- Offline usage does not block saving progress.

### UX

- The design is consistent, original, kawaii, and readable.
- No official Hello Kitty material is used.
- Core mobile touch targets are at least 44 × 44 px.
- Correctness is not communicated by color alone.
- Reduced-motion behavior works.
- The core flow is keyboard accessible.

### Engineering

- TypeScript strict mode passes.
- Linting passes.
- Unit and component tests pass.
- Critical Playwright flows pass.
- Production build succeeds.
- No secrets or external tracking scripts exist in the bundle.

---

## 26. Recommended implementation phases

## Phase 1 — Foundation

- initialize project and quality tooling;
- create application shell and design tokens;
- configure router, Pinia, Dexie, and PWA;
- implement local profiles;
- implement database schemas and migrations;
- create repository interfaces;
- add base layout and navigation.

## Phase 2 — Learning engine

- curriculum graph;
- exercise contracts;
- deterministic random generator;
- validators;
- mastery engine;
- review scheduler;
- error classification;
- unit tests.

## Phase 3 — Learning experience

- onboarding;
- diagnostic;
- dashboard;
- learning map;
- lesson player;
- fraction/math inputs;
- autosave and resume.

## Phase 4 — Content

- implement the 15 required foundational topics;
- add visual fraction models;
- create generated exercise templates;
- validate all explanations and solutions;
- test equivalent-answer handling.

## Phase 5 — Motivation and insights

- XP and levels;
- streak;
- achievements;
- collection;
- mistake journal;
- progress dashboard.

## Phase 6 — Reliability and release

- backup export/import;
- offline validation;
- accessibility pass;
- responsive QA;
- end-to-end tests;
- production build;
- deployment configuration.

Each phase must leave the application buildable and testable. Do not postpone all tests until the final phase.

---

## 27. Instructions for Codex

Implement this specification as a production-quality frontend application.

### Working rules

1. Inspect the repository before changing files.
2. If the repository is empty, initialize the specified Vue/Vite stack.
3. Create a concise implementation plan and execute it incrementally.
4. Keep the application runnable after each major phase.
5. Prefer pure domain functions and typed content schemas.
6. Do not introduce a backend or fake HTTP layer.
7. Do not use official Hello Kitty assets or copy the character.
8. Do not use placeholder lorem ipsum.
9. Do not leave the core learning flow as static mockups.
10. Implement real persistence, exercise validation, progress, and resume behavior.
11. Write meaningful tests for domain logic and critical flows.
12. Run type checking, linting, tests, and production build before handoff.
13. Document local development, testing, build, deployment, backup behavior, and architecture in the README.

### Judgment policy

Codex may make minor implementation choices without asking if they preserve this specification. It should pause and ask only when a choice would materially change:

- the frontend-only constraint;
- the learning model;
- the required curriculum;
- data-loss behavior;
- privacy;
- the original kawaii visual direction;
- MVP scope.

---

## 28. Suggested README commands

Use the package manager already present in the repository. If none exists, prefer npm unless the implementation environment strongly favors another supported manager.

The final README should document commands equivalent to:

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
npm run preview
```

---

## 29. Future backend migration boundary

The MVP remains frontend-only. However, keep these boundaries:

- domain entities are independent of IndexedDB;
- repositories hide persistence details;
- records include stable IDs and timestamps;
- backup format is versioned;
- content has stable IDs;
- synchronization metadata may be added later without replacing the learning engine;
- UI does not call Dexie directly.

A future backend should be introduced as synchronization around local-first storage, not as a rewrite of the application.

---

## 30. Final product statement

Math Kitty Academy should feel like a cozy personal academy that happens to teach mathematics seriously. Its visual charm should make the student willing to open it; its learning engine, explanations, practice, repetition, and progress tracking should make that time useful.

