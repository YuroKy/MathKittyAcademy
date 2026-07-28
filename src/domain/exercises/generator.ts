import type { ExerciseInstance } from '@/types/domain'

function hashSeed(seed: string): number {
  let hash = 2166136261
  for (const character of seed) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed: string): () => number {
  let state = hashSeed(seed)
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function integer(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

export function generateNaturalNumbersExercise(
  templateId: 'addition' | 'subtraction' | 'multiplication',
  seed: string,
): ExerciseInstance {
  const random = seededRandom(`${templateId}:${seed}`)

  if (templateId === 'addition') {
    const a = integer(random, 12, 48)
    const b = integer(random, 11, 39)
    return {
      id: `${templateId}:${seed}`,
      templateId,
      seed,
      topicId: 'natural-numbers',
      skillIds: ['addition'],
      difficulty: 1,
      kind: 'numericInput',
      prompt: `${a} + ${b} = ?`,
      expectedAnswer: String(a + b),
      hints: [
        `Розклади ${b} на десятки й одиниці.`,
        `Спочатку додай десятки, потім — одиниці.`,
      ],
      solutionSteps: [`Додаємо числа: ${a} + ${b} = ${a + b}.`, `Отже, відповідь — ${a + b}.`],
    }
  }

  if (templateId === 'subtraction') {
    const b = integer(random, 10, 35)
    const result = integer(random, 8, 42)
    const a = b + result
    return {
      id: `${templateId}:${seed}`,
      templateId,
      seed,
      topicId: 'natural-numbers',
      skillIds: ['subtraction'],
      difficulty: 1,
      kind: 'numericInput',
      prompt: `${a} − ${b} = ?`,
      expectedAnswer: String(result),
      hints: [
        `Подумай, скільки треба додати до ${b}, щоб отримати ${a}.`,
        `Перевір результат додаванням: відповідь + ${b} має дорівнювати ${a}.`,
      ],
      solutionSteps: [`Віднімаємо ${b} від ${a}: отримуємо ${result}.`, `${result} + ${b} = ${a}, тож відповідь правильна.`],
    }
  }

  const a = integer(random, 3, 9)
  const b = integer(random, 3, 9)
  return {
    id: `${templateId}:${seed}`,
    templateId,
    seed,
    topicId: 'natural-numbers',
    skillIds: ['multiplication'],
    difficulty: 2,
    kind: 'numericInput',
    prompt: `${a} × ${b} = ?`,
    expectedAnswer: String(a * b),
    hints: [
      `${a} × ${b} — це ${b} однакових груп по ${a}.`,
      `Можна додати ${a} до себе ${b} разів.`,
    ],
    solutionSteps: [`${a} × ${b} = ${a * b}.`, `Отже, відповідь — ${a * b}.`],
  }
}

export function buildNaturalNumbersExerciseSet(sessionId: string): ExerciseInstance[] {
  return [
    generateNaturalNumbersExercise('addition', `${sessionId}:0`),
    generateNaturalNumbersExercise('subtraction', `${sessionId}:1`),
    generateNaturalNumbersExercise('multiplication', `${sessionId}:2`),
  ]
}
