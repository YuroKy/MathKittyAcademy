import { curriculumTopics } from '@/content/curriculum/topics'
import type { TopicPreview } from '@/types/domain'

const authoredTopicPreviews: Record<string, TopicPreview> = {
  'natural-numbers': {
    topicId: 'natural-numbers',
    hook: 'Зберемо однакові групи й самі побачимо, як народжується множення.',
    question: 'У трьох коробках по 4 олівці. Яка дія найкоротше знайде всі олівці?',
    choices: ['3 + 4', '3 × 4', '4 − 3'],
    correctChoiceIndex: 1,
    explanation: 'Три однакові групи по чотири — це 3 × 4 = 12.',
    challengeLabel: 'Зібрати групи',
  },
  'order-of-operations': {
    topicId: 'order-of-operations',
    hook: 'Один вираз може дати різні відповіді, якщо виконувати дії навмання.',
    question: 'Що виконуємо першим у виразі 2 + 3 × 4?',
    choices: ['Додавання', 'Множення', 'Будь-яку дію'],
    correctChoiceIndex: 1,
    explanation: 'Множення має вищий пріоритет: спочатку 3 × 4, потім додаємо 2.',
    challengeLabel: 'Обрати першу дію',
  },
  'negative-numbers': {
    topicId: 'negative-numbers',
    hook: 'Температура, борг і поверхи під землею допомагають відчути числа менші за нуль.',
    question: 'Було −2 °C, стало на 3 градуси тепліше. Яка температура тепер?',
    choices: ['−5 °C', '1 °C', '5 °C'],
    correctChoiceIndex: 1,
    explanation: 'На числовій прямій рухаємося від −2 на три кроки вправо й отримуємо 1.',
    challengeLabel: 'Пройти числовою прямою',
  },
  divisibility: {
    topicId: 'divisibility',
    hook: 'Ознаки подільності дозволяють бачити відповідь без довгого ділення.',
    question: 'Яке число точно ділиться на 3?',
    choices: ['124', '126', '127'],
    correctChoiceIndex: 1,
    explanation: '1 + 2 + 6 = 9, а 9 ділиться на 3, тому 126 теж ділиться.',
    challengeLabel: 'Знайти кратне',
  },
  'fraction-meaning': {
    topicId: 'fraction-meaning',
    hook: 'Дріб — це не страшний запис, а просто кількість обраних рівних частин.',
    question: 'Плитку поділили на 6 рівних частин і взяли 3. Який дріб описує взяте?',
    choices: ['3/6', '6/3', '3/3'],
    correctChoiceIndex: 0,
    explanation: 'Усього 6 рівних частин — це знаменник. Взяли 3 — це чисельник.',
    challengeLabel: 'Зафарбувати дріб',
  },
  'comparing-fractions': {
    topicId: 'comparing-fractions',
    hook: 'Візуальні смужки одразу показують, яка частина більша.',
    question: 'Який дріб більший?',
    choices: ['1/4', '3/4', 'Вони рівні'],
    correctChoiceIndex: 1,
    explanation: 'Якщо знаменники однакові, більше рівних частин означає більший дріб.',
    challengeLabel: 'Порівняти смужки',
  },
  'equivalent-fractions': {
    topicId: 'equivalent-fractions',
    hook: 'Одну й ту саму частину можна записати різними дробами.',
    question: 'Який дріб дорівнює 1/2?',
    choices: ['2/3', '2/4', '3/4'],
    correctChoiceIndex: 1,
    explanation: 'Якщо поділити ціле на 4 частини, половина займає 2 з них: 2/4.',
    challengeLabel: 'Знайти рівну частину',
  },
  'fraction-addition-equal': {
    topicId: 'fraction-addition-equal',
    hook: 'Коли частини однакового розміру, їх можна просто порахувати разом.',
    question: 'Скільки буде 2/7 + 3/7?',
    choices: ['5/7', '5/14', '6/7'],
    correctChoiceIndex: 0,
    explanation: 'Сьомі частини не змінюють розмір, тому додаємо лише їхню кількість.',
    challengeLabel: 'Скласти частини',
  },
  'fraction-addition-different': {
    topicId: 'fraction-addition-different',
    hook: 'Перед додаванням частини різного розміру треба зробити однаковими.',
    question: 'До якого знаменника зручно звести 1/2 і 1/4?',
    choices: ['3', '4', '8'],
    correctChoiceIndex: 1,
    explanation: 'Половину легко подати як 2/4, після чого четверті можна додавати.',
    challengeLabel: 'Зрівняти частини',
  },
  'fraction-multiplication': {
    topicId: 'fraction-multiplication',
    hook: 'Множення дробів можна побачити як частину від іншої частини.',
    question: 'Що означає 1/2 від 1/2?',
    choices: ['1/4', '1', '2/2'],
    correctChoiceIndex: 0,
    explanation: 'Половина від половини цілого займає одну четверту.',
    challengeLabel: 'Накласти частини',
  },
  decimals: {
    topicId: 'decimals',
    hook: 'Кома показує десяті, соті й тисячні частини одиниці.',
    question: 'Яке число більше?',
    choices: ['0,7', '0,65', 'Вони рівні'],
    correctChoiceIndex: 0,
    explanation: '0,7 можна записати як 0,70, а 70 сотих більше за 65 сотих.',
    challengeLabel: 'Порівняти розряди',
  },
  'fraction-decimal-conversion': {
    topicId: 'fraction-decimal-conversion',
    hook: 'Звичайний і десятковий дріб можуть бути двома іменами одного числа.',
    question: 'Який десятковий запис відповідає 1/2?',
    choices: ['0,2', '0,5', '1,2'],
    correctChoiceIndex: 1,
    explanation: 'Одна поділена на два дорівнює 0,5.',
    challengeLabel: 'Поєднати записи',
  },
  percentages: {
    topicId: 'percentages',
    hook: 'Відсоток — це одна сота, тож 100% означає ціле.',
    question: '50% плитки шоколаду — це яка частина?',
    choices: ['Половина', 'Чверть', 'Уся плитка'],
    correctChoiceIndex: 0,
    explanation: '50 зі 100 рівних частин — це половина.',
    challengeLabel: 'Зібрати 100%',
  },
  'ratios-proportions': {
    topicId: 'ratios-proportions',
    hook: 'Пропорція допомагає зберігати однакове співвідношення.',
    question: 'На 2 склянки води треба 1 ложка сиропу. Скільки ложок на 4 склянки?',
    choices: ['1', '2', '4'],
    correctChoiceIndex: 1,
    explanation: 'Води стало вдвічі більше, тому сиропу теж потрібно вдвічі більше.',
    challengeLabel: 'Зберегти пропорцію',
  },
  'linear-equations': {
    topicId: 'linear-equations',
    hook: 'Рівняння — це терези: однакова дія з обох боків зберігає рівновагу.',
    question: 'Як знайти x у рівнянні x + 3 = 8?',
    choices: ['Додати 3', 'Відняти 3', 'Помножити на 3'],
    correctChoiceIndex: 1,
    explanation: 'Віднімаємо 3 з обох боків і отримуємо x = 5.',
    challengeLabel: 'Урівноважити терези',
  },
}

function buildExplorationPreview(topic: (typeof curriculumTopics)[number]): TopicPreview {
  return {
    topicId: topic.id,
    hook: `${topic.shortDescription} Почнемо з короткого дослідження на конкретному прикладі.`,
    question: `Що найкраще допоможе розібратися з темою «${topic.title}»?`,
    choices: [
      'Побудувати модель і перевірити закономірність на прикладі',
      'Вгадати відповідь, не читаючи умову',
      'Запам’ятати один результат без пояснення',
    ],
    correctChoiceIndex: 0,
    explanation:
      'Модель, означення та перевірений приклад допомагають зрозуміти правило, а не лише запам’ятати відповідь.',
    challengeLabel: 'Дослідити приклад',
  }
}

export const topicPreviews: Record<string, TopicPreview> = Object.fromEntries(
  curriculumTopics.map((topic) => [
    topic.id,
    authoredTopicPreviews[topic.id] ?? buildExplorationPreview(topic),
  ]),
)

export function findTopicPreview(topicId: string): TopicPreview | undefined {
  return topicPreviews[topicId]
}
