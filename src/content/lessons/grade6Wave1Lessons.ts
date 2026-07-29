import type { FullLessonContent, LessonExerciseTemplate, TopicPreview } from '@/types/domain'

import {
  grade6Wave1Qa,
  type Grade6Wave1TopicId,
} from './grade6Wave1Qa'

const rationalRule = {
  type: 'fractionRuleError' as const,
  pattern: 'not-equivalent',
  explanationKey: 'fraction-equivalence',
}

function preview(
  topicId: Grade6Wave1TopicId,
  hook: string,
  question: string,
  choices: string[],
  correctChoiceIndex: number,
  explanation: string,
): TopicPreview {
  return {
    topicId,
    hook,
    question,
    choices,
    correctChoiceIndex,
    explanation,
    challengeLabel: 'Перевірити ідею на новому прикладі',
  }
}

function lesson(
  topicId: Grade6Wave1TopicId,
  data: Omit<FullLessonContent, 'topicId' | 'qa'>,
): FullLessonContent {
  return { topicId, qa: grade6Wave1Qa[topicId], ...data }
}

function numeric(
  templateId: string,
  skillIds: string[],
  title: string,
  prompt: string,
  expectedAnswer: string,
  hints: [string, string],
  solutionSteps: string[],
  difficulty: 1 | 2 | 3 = 2,
): LessonExerciseTemplate {
  return {
    templateId,
    skillIds,
    difficulty,
    kind: 'numericInput',
    title,
    prompt,
    expectedAnswer,
    answerSpec: { kind: 'rational', value: expectedAnswer },
    validationStrategy: 'rational',
    errorRules: [rationalRule],
    hints,
    simplerExplanation: `Розбий завдання на короткі дії: ${solutionSteps.join(' ')}`,
    solutionSteps,
  }
}

function fraction(
  templateId: string,
  skillIds: string[],
  title: string,
  prompt: string,
  expectedAnswer: string,
  hints: [string, string],
  solutionSteps: string[],
  difficulty: 1 | 2 | 3 = 2,
): LessonExerciseTemplate {
  return {
    ...numeric(templateId, skillIds, title, prompt, expectedAnswer, hints, solutionSteps, difficulty),
    kind: 'fractionInput',
  }
}

function matching(
  templateId: string,
  skillIds: string[],
  title: string,
  prompt: string,
  pairs: Record<string, string>,
): LessonExerciseTemplate {
  return {
    templateId,
    skillIds,
    difficulty: 2,
    kind: 'matching',
    title,
    prompt,
    expectedAnswer: Object.entries(pairs).map(([left, right]) => `${left} → ${right}`).join('; '),
    answerSpec: { kind: 'matching', pairs },
    matchingPairs: Object.entries(pairs).map(([left, right]) => ({ left, right })),
    hints: ['Перевір кожну пару окремо.', 'Почни з пари, яку можеш довести однією дією.'],
    simplerExplanation: 'Для кожного запису знайди лише один відповідний результат.',
    solutionSteps: Object.entries(pairs).map(([left, right]) => `${left} відповідає ${right}.`),
  }
}

function steps(
  templateId: string,
  skillIds: string[],
  title: string,
  prompt: string,
  values: Array<[string, string]>,
): LessonExerciseTemplate {
  return {
    templateId,
    skillIds,
    difficulty: 3,
    kind: 'stepByStep',
    title,
    prompt,
    expectedAnswer: values.at(-1)?.[1] ?? '',
    answerSpec: {
      kind: 'stepByStep',
      steps: values.map(([, value]) => ({ value, strategy: 'rational' })),
    },
    stepDefinitions: values.map(([stepPrompt, expectedAnswer], index) => ({
      id: `${templateId}-step-${index + 1}`,
      prompt: stepPrompt,
      expectedAnswer,
      validationStrategy: 'rational',
    })),
    hints: ['Виконуй лише відкритий крок.', 'Перевір попередній результат перед наступною дією.'],
    simplerExplanation: 'Один правильний короткий крок відкриває наступний.',
    solutionSteps: values.map(([stepPrompt, value]) => `${stepPrompt}: ${value}.`),
  }
}

const divisibility = lesson('divisibility', {
  preview: preview(
    'divisibility',
    'Ознаки подільності дають відповідь без письмового ділення.',
    'Яке число ділиться і на 2, і на 3?',
    ['124', '126', '135'],
    1,
    '126 парне, а сума його цифр 9 ділиться на 3.',
  ),
  introTitle: 'Подільність можна побачити в записі числа',
  introText: 'Дільник ділить число без остачі, а кратне утворюється множенням цього дільника.',
  mascotMessage: 'Шукатимемо короткі числові підказки замість довгого ділення.',
  interactionKind: 'conceptCards',
  explorationTitle: 'Відкрий ознаки 2, 3, 5, 9 і 10',
  explorationItems: [
    { label: '2 і 5', content: 'Для 2 дивимось на парність останньої цифри, для 5 — на 0 або 5.' },
    { label: '3 і 9', content: 'Перевіряємо подільність суми цифр.' },
    { label: '10', content: 'Число кратне 10, якщо закінчується нулем.' },
  ],
  guidedTitle: 'Перевіримо число 2 430',
  guidedSteps: ['Остання цифра 0: число ділиться на 2, 5 і 10.', 'Сума цифр 9: число ділиться на 3 і 9.', 'Кожну ознаку підтверджуємо окремо.'],
  summaryText: 'Ти розрізняєш дільники й кратні та застосовуєш ознаки подільності.',
  exercises: [
    {
      templateId: 'g6-divisibility-choice',
      skillIds: ['divisibility-rules'],
      difficulty: 1,
      kind: 'multipleChoice',
      title: 'Обери всі кратні 3',
      prompt: 'Познач усі числа, які діляться на 3.',
      expectedAnswer: '126, 234',
      choices: ['124', '126', '205', '234'],
      answerSpec: { kind: 'multipleChoice', values: ['126', '234'] },
      hints: ['Знайди суму цифр кожного числа.', 'Суми 9 і 9 діляться на 3.'],
      simplerExplanation: 'Склади цифри; якщо сума кратна 3, число теж кратне 3.',
      solutionSteps: ['1 + 2 + 6 = 9.', '2 + 3 + 4 = 9.', 'Отже, обираємо 126 і 234.'],
    },
    numeric('g6-divisibility-factor', ['factors'], 'Знайди дільник', 'Найбільший однозначний дільник числа 72?', '9', ['Перевір числа від 9 вниз.', '72 : 9 = 8 без остачі.'], ['72 = 9 × 8.', 'Отже, відповідь 9.']),
    numeric('g6-divisibility-multiple', ['multiples'], 'Продовж ряд кратних', 'Яке наступне число: 14, 21, 28, ...?', '35', ['Різниця між сусідніми числами однакова.', 'Це послідовні кратні 7.'], ['28 + 7 = 35.', 'Наступне кратне — 35.']),
  ],
})

const primeFactorization = lesson('prime-factorization', {
  preview: preview('prime-factorization', 'Складене число можна розібрати на прості цеглинки.', 'Який розклад числа 18?', ['2 × 9', '2 × 3 × 3', '3 × 6'], 1, 'У добутку 2 × 3 × 3 усі множники прості.'),
  introTitle: 'Прості множники — цеглинки натурального числа',
  introText: 'Будуємо дерево множників, доки на кожній гілці не залишаться лише прості числа.',
  mascotMessage: 'Розклад може мати різні гілки, але прості множники збігаються.',
  interactionKind: 'conceptCards',
  explorationTitle: 'Від складеного числа до простих множників',
  explorationItems: [{ label: 'Просте', content: 'Має рівно два натуральні дільники.' }, { label: 'Складене', content: 'Має більше двох натуральних дільників.' }, { label: 'Перевірка', content: 'Добуток простих множників має відновити число.' }],
  guidedTitle: 'Розкладемо 60',
  guidedSteps: ['60 = 6 × 10.', '6 = 2 × 3, а 10 = 2 × 5.', '60 = 2 × 2 × 3 × 5.'],
  summaryText: 'Ти будуєш дерево множників і перевіряєш розклад множенням.',
  exercises: [
    matching('g6-prime-match', ['prime-factorization'], 'З’єднай число й розклад', 'Добери повний розклад на прості множники.', { '12': '2 × 2 × 3', '20': '2 × 2 × 5', '45': '3 × 3 × 5' }),
    steps('g6-factor-tree', ['factor-tree'], 'Побудуй дерево для 84', 'Заповни гілки дерева множників.', [['84 : 2', '42'], ['42 : 2', '21'], ['21 : 3', '7']]),
    numeric('g6-prime-product', ['prime-factorization'], 'Віднови число', 'Яке число має розклад 2 × 2 × 3 × 7?', '84', ['Перемножуй по двоє.', '2 × 2 = 4, а 3 × 7 = 21.'], ['4 × 21 = 84.', 'Отже, число 84.']),
  ],
})

const greatestCommonDivisor = lesson('greatest-common-divisor', {
  preview: preview('greatest-common-divisor', 'НСД — найбільший розмір рівної групи без залишку.', 'НСД(18, 24) = ?', ['3', '6', '12'], 1, 'Найбільший спільний дільник 18 і 24 — 6.'),
  introTitle: 'НСД знаходить найбільшу спільну частину',
  introText: 'Порівнюємо дільники або спільні прості множники двох чисел.',
  mascotMessage: 'Залишаємо лише множники, спільні для обох чисел.',
  interactionKind: 'conceptCards',
  explorationTitle: 'Два способи знайти НСД',
  explorationItems: [{ label: 'Списки', content: 'Виписуємо дільники обох чисел.' }, { label: 'Розклад', content: 'Беремо спільні прості множники.' }, { label: 'Взаємно прості', content: 'Їхній НСД дорівнює 1.' }],
  guidedTitle: 'Знайдемо НСД(36, 48)',
  guidedSteps: ['36 = 2² × 3².', '48 = 2⁴ × 3.', 'Спільна частина 2² × 3 = 12.'],
  summaryText: 'Ти знаходиш НСД двома способами й розпізнаєш взаємно прості числа.',
  exercises: [
    matching('g6-gcd-match', ['greatest-common-divisor'], 'З’єднай пару та НСД', 'Обчисли НСД кожної пари.', { '12 і 18': '6', '14 і 21': '7', '8 і 15': '1' }),
    steps('g6-gcd-steps', ['greatest-common-divisor'], 'НСД через розклад', 'Знайди НСД(72, 90).', [['Спільний степінь 2', '2'], ['Спільний степінь 3', '9'], ['Добуток спільних множників', '18']]),
    numeric('g6-coprime', ['coprime-numbers'], 'Взаємно прості числа', 'НСД(25, 36) = ?', '1', ['Перевір спільні прості множники.', '25 = 5², 36 = 2² × 3².'], ['Спільних простих множників немає.', 'НСД дорівнює 1.']),
  ],
})

const leastCommonMultiple = lesson('least-common-multiple', {
  preview: preview('least-common-multiple', 'НСК показує першу спільну зупинку двох ритмів.', 'НСК(6, 8) = ?', ['12', '24', '48'], 1, '24 — перше число, кратне і 6, і 8.'),
  introTitle: 'НСК — найменше спільне кратне',
  introText: 'Шукаємо перше спільне кратне у списках або збираємо всі потрібні прості множники.',
  mascotMessage: 'Обидва числа мають ділити НСК без остачі.',
  interactionKind: 'conceptCards',
  explorationTitle: 'Як не переплутати НСК і НСД',
  explorationItems: [{ label: 'Кратні', content: 'НСК не менше за кожне з додатних чисел.' }, { label: 'Розклад', content: 'Беремо найбільші потрібні степені простих множників.' }, { label: 'Перевірка', content: 'Ділимо результат на обидва числа.' }],
  guidedTitle: 'Знайдемо НСК(12, 18)',
  guidedSteps: ['12 = 2² × 3.', '18 = 2 × 3².', 'НСК = 2² × 3² = 36.'],
  summaryText: 'Ти знаходиш НСК і перевіряєш його діленням на кожне число.',
  exercises: [
    matching('g6-lcm-match', ['least-common-multiple'], 'З’єднай пару та НСК', 'Добери найменше спільне кратне.', { '4 і 6': '12', '6 і 9': '18', '8 і 10': '40' }),
    steps('g6-lcm-steps', ['least-common-multiple'], 'НСК через прості множники', 'Знайди НСК(18, 24).', [['Найбільший потрібний степінь 2', '8'], ['Найбільший потрібний степінь 3', '9'], ['Добуток', '72']]),
    numeric('g6-common-multiple', ['common-multiples'], 'Спільний ритм', 'Один сигнал лунає кожні 6 хв, інший — кожні 8 хв. Через скільки хвилин вони зійдуться?', '24', ['Потрібне найменше спільне кратне.', 'Кратні 8: 8, 16, 24.'], ['24 ділиться і на 6, і на 8.', 'Отже, через 24 хвилини.']),
  ],
})

const equivalentFractions = lesson('equivalent-fractions', {
  preview: preview('equivalent-fractions', 'Різні дроби можуть показувати ту саму частину.', 'Який дріб дорівнює 2/3?', ['4/6', '3/5', '6/8'], 0, 'Чисельник і знаменник 2/3 помножили на 2.'),
  introTitle: 'Значення дробу не змінюється при однаковій дії',
  introText: 'Множимо або ділимо чисельник і знаменник на те саме ненульове число.',
  mascotMessage: 'Змінюємо запис, але не розмір частини.',
  interactionKind: 'fractionBar',
  explorationTitle: 'Порівняй моделі рівних дробів',
  explorationItems: [{ label: 'Розширення', content: 'Множимо обидві частини дробу.' }, { label: 'Скорочення', content: 'Ділимо чисельник і знаменник на спільний дільник.' }, { label: 'Перевірка', content: 'Перехресні добутки рівні.' }],
  guidedTitle: 'Скоротимо 18/24',
  guidedSteps: ['НСД(18, 24) = 6.', '18 : 6 = 3, 24 : 6 = 4.', '18/24 = 3/4.'],
  summaryText: 'Ти будуєш рівні дроби й скорочуєш їх до найпростішого вигляду.',
  exercises: [
    fraction('g6-equivalent', ['equivalent-fractions'], 'Доповни рівність', '3/5 = ?/20. Запиши отриманий дріб.', '12/20', ['Знаменник помножили на 4.', 'Чисельник теж помнож на 4.'], ['3 × 4 = 12.', 'Отримуємо 12/20.']),
    matching('g6-fraction-model-match', ['equivalent-fractions'], 'З’єднай рівні дроби', 'Добери еквівалентний дріб.', { '1/2': '4/8', '2/3': '6/9', '3/5': '9/15' }),
    fraction('g6-simplify', ['simplify-fractions'], 'Скороти дріб', 'Скороти 42/56 до найпростішого вигляду.', '3/4', ['Знайди НСД(42, 56).', 'Поділи обидві частини на 14.'], ['42 : 14 = 3.', '56 : 14 = 4.', 'Отже, 3/4.'], 3),
  ],
})

const fractionAddition = lesson('fraction-addition-different', {
  preview: preview('fraction-addition-different', 'Додавати можна лише однакові частини цілого.', '1/2 + 1/3 = ?', ['2/5', '5/6', '1/6'], 1, 'Зводимо до шостих: 3/6 + 2/6 = 5/6.'),
  introTitle: 'Спільний знаменник робить частини однаковими',
  introText: 'Знаходимо НСК знаменників, розширюємо дроби й виконуємо дію з чисельниками.',
  mascotMessage: 'Спочатку назвемо частини однаково, потім їх порахуємо.',
  interactionKind: 'fractionBar',
  explorationTitle: 'Від різних частин до спільних',
  explorationItems: [{ label: 'Спільний знаменник', content: 'Зручний вибір — НСК знаменників.' }, { label: 'Додатковий множник', content: 'Показує, у скільки разів розширити дріб.' }, { label: 'Скорочення', content: 'Перевіряємо остаточну відповідь.' }],
  guidedTitle: 'Обчислимо 3/4 + 2/3',
  guidedSteps: ['НСК(4, 3) = 12.', '3/4 = 9/12, 2/3 = 8/12.', '9/12 + 8/12 = 17/12.'],
  summaryText: 'Ти знаходиш спільний знаменник і виконуєш дії з рівними частинами.',
  exercises: [
    fraction('g6-add-unlike', ['add-unlike-fractions'], 'Додай дроби', '2/3 + 1/4 = ?', '11/12', ['НСК(3, 4) = 12.', '2/3 = 8/12, 1/4 = 3/12.'], ['8/12 + 3/12 = 11/12.', 'Дріб нескоротний.']),
    steps('g6-common-denominator', ['common-denominator'], 'Зведи й додай', 'Обчисли 5/6 + 1/8.', [['Спільний знаменник', '24'], ['Перший чисельник після розширення', '20'], ['Чисельник суми', '23']]),
    fraction('g6-subtract-unlike', ['subtract-unlike-fractions'], 'Відніми дроби', '7/10 − 1/4 = ?', '9/20', ['НСК(10, 4) = 20.', '7/10 = 14/20, 1/4 = 5/20.'], ['14/20 − 5/20 = 9/20.', 'Відповідь 9/20.'], 3),
  ],
})

const fractionMultiplication = lesson('fraction-multiplication', {
  preview: preview('fraction-multiplication', 'При множенні дробів частина береться від частини.', '2/3 × 3/5 = ?', ['2/5', '5/8', '6/8'], 0, 'Скорочуємо 3 і отримуємо 2/5.'),
  introTitle: 'Чисельники множимо з чисельниками',
  introText: 'Перед множенням скорочуємо спільні множники, а ділення замінюємо множенням на обернений дріб.',
  mascotMessage: 'Скорочення до множення робить числа маленькими.',
  interactionKind: 'fractionBar',
  explorationTitle: 'Множення, обернений дріб і ділення',
  explorationItems: [{ label: 'Множення', content: 'Множимо чисельники та знаменники.' }, { label: 'Обернений дріб', content: 'Міняємо чисельник і знаменник місцями.' }, { label: 'Ділення', content: 'Множимо на дріб, обернений до дільника.' }],
  guidedTitle: 'Обчислимо 6/7 × 14/15',
  guidedSteps: ['Скорочуємо 6 і 15 на 3, 14 і 7 на 7.', 'Отримуємо 2/1 × 2/5.', 'Добуток дорівнює 4/5.'],
  summaryText: 'Ти множиш і ділиш дроби та використовуєш скорочення до обчислення.',
  exercises: [
    fraction('g6-multiply-fractions', ['multiply-fractions'], 'Помнож дроби', '3/8 × 4/9 = ?', '1/6', ['Скороти 3 і 9, 4 і 8.', 'Залишиться 1/2 × 1/3.'], ['1 × 1 = 1.', '2 × 3 = 6.', 'Відповідь 1/6.']),
    matching('g6-reciprocal-match', ['reciprocal-numbers'], 'Знайди обернений дріб', 'З’єднай число з оберненим.', { '2/7': '7/2', '5': '1/5', '3/4': '4/3' }),
    steps('g6-divide-fractions', ['divide-fractions'], 'Поділи дроби', 'Обчисли 5/6 : 10/9.', [['Обернений до 10/9 дріб', '9/10'], ['Добуток 5/6 × 9/10', '45/60'], ['Скорочений результат', '3/4']]),
  ],
})

export const grade6Wave1Lessons: Record<Grade6Wave1TopicId, FullLessonContent> = {
  divisibility,
  'prime-factorization': primeFactorization,
  'greatest-common-divisor': greatestCommonDivisor,
  'least-common-multiple': leastCommonMultiple,
  'equivalent-fractions': equivalentFractions,
  'fraction-addition-different': fractionAddition,
  'fraction-multiplication': fractionMultiplication,
}
