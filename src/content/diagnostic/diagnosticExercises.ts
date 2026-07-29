import type { ExerciseInstance } from '@/types/domain'

interface DiagnosticDefinition {
  skillId: string
  topicId: string
  title: string
  prompts: [string, string]
  answers: [string, string]
  hints: [string, string]
}

export const diagnosticDefinitions: DiagnosticDefinition[] = [
  { skillId: 'basic-arithmetic', topicId: 'natural-numbers', title: 'Арифметика', prompts: ['Скільки буде 48 + 27?', 'Скільки буде 144 ÷ 12?'], answers: ['75', '12'], hints: ['Додай десятки й одиниці окремо.', 'Згадай таблицю множення на 12.'] },
  { skillId: 'operation-order', topicId: 'order-of-operations', title: 'Порядок дій', prompts: ['Обчисли 6 + 3 · 4.', 'Обчисли (18 − 6) ÷ 3 + 5.'], answers: ['18', '9'], hints: ['Множення виконуємо раніше за додавання.', 'Спочатку виконай дію в дужках.'] },
  { skillId: 'negative-numbers', topicId: 'negative-numbers', title: 'Від’ємні числа', prompts: ['Обчисли −3 + 8.', 'Обчисли −7 − 5.'], answers: ['5', '-12'], hints: ['Від восьми зроби три кроки назад.', 'Від −7 рухайся ще на п’ять ліворуч.'] },
  { skillId: 'fractions', topicId: 'fraction-meaning', title: 'Дроби', prompts: ['Яка половина числа 18?', 'Обчисли 1/4 + 2/4.'], answers: ['9', '3/4'], hints: ['Поділи 18 на 2.', 'Знаменники однакові — додай чисельники.'] },
  { skillId: 'decimals', topicId: 'decimals', title: 'Десяткові дроби', prompts: ['Обчисли 2,5 + 1,3.', 'Обчисли 4,8 ÷ 2.'], answers: ['3.8', '2.4'], hints: ['Додай десяті до десятих.', 'Половина 4,8 — це…'] },
  { skillId: 'percentages', topicId: 'percentages', title: 'Відсотки', prompts: ['Знайди 10% від 80.', 'Знайди 25% від 60.'], answers: ['8', '15'], hints: ['10% — це одна десята.', '25% — це одна четверта.'] },
  { skillId: 'proportions', topicId: 'ratios-proportions', title: 'Пропорції', prompts: ['Якщо 2 зошити коштують 30 грн, скільки коштує один?', '3 кг яблук коштують 72 грн. Скільки коштують 5 кг?'], answers: ['15', '120'], hints: ['Поділи загальну вартість на 2.', 'Спершу знайди ціну одного кілограма.'] },
  { skillId: 'simple-equations', topicId: 'grade6-equations', title: 'Рівняння', prompts: ['Розв’яжи x + 7 = 15.', 'Розв’яжи 3x = 27.'], answers: ['8', '9'], hints: ['Відніми 7 від обох частин.', 'Поділи обидві частини на 3.'] },
  { skillId: 'geometry-awareness', topicId: 'measurement-geometry', title: 'Геометрія', prompts: ['Периметр квадрата зі стороною 6 см?', 'Площа прямокутника 7 см на 4 см?'], answers: ['24', '28'], hints: ['У квадрата чотири рівні сторони.', 'Площу прямокутника знаходимо множенням сторін.'] },
]

export function buildDiagnosticExercise(seed: string, sessionId: string): ExerciseInstance | undefined {
  const [skillId, rawLevel] = seed.split(':')
  const level = rawLevel === '1' ? 1 : 0
  const definition = diagnosticDefinitions.find((entry) => entry.skillId === skillId)
  if (!definition) return undefined
  return {
    id: `${sessionId}:diagnostic:${skillId}:${level}`,
    templateId: `diagnostic-${skillId}-${level}`,
    seed,
    topicId: definition.topicId,
    skillIds: [definition.skillId],
    difficulty: level === 0 ? 1 : 2,
    kind: definition.answers[level].includes('/') ? 'fractionInput' : 'numericInput',
    title: definition.title,
    prompt: definition.prompts[level],
    expectedAnswer: definition.answers[level],
    hints: [definition.hints[level], 'Якщо не знаєш — це нормально: обери «Не знаю».'],
    solutionSteps: [`Правильна відповідь: ${definition.answers[level]}.`],
  }
}
