import type { AnswerSpec, ExerciseAnswer, ExerciseInstance } from '@/types/domain'

import { areEquivalentAnswers } from './rational'

export function validateExerciseAnswer(
  exercise: ExerciseInstance,
  raw: ExerciseAnswer,
): boolean {
  if (exercise.answerSpec) return validateAnswerSpec(exercise.answerSpec, raw)
  const actual = typeof raw === 'string' ? raw.trim().replace(',', '.') : ''
  const expected = exercise.expectedAnswer.trim().replace(',', '.')
  switch (exercise.validationStrategy) {
    case 'exact':
    case 'choice':
      return actual.toLocaleLowerCase('uk-UA') === expected.toLocaleLowerCase('uk-UA')
    case 'decimalTolerance': {
      const actualNumber = Number(actual)
      const expectedNumber = Number(expected)
      return (
        Number.isFinite(actualNumber) &&
        Number.isFinite(expectedNumber) &&
        Math.abs(actualNumber - expectedNumber) <= (exercise.tolerance ?? 0.001)
      )
    }
    case 'rational':
    default:
      return areEquivalentAnswers(actual, expected)
  }
}

export function validateAnswerSpec(spec: AnswerSpec, raw: ExerciseAnswer): boolean {
  switch (spec.kind) {
    case 'rational':
      return typeof raw === 'string' && areEquivalentAnswers(raw, spec.value)
    case 'decimalTolerance': {
      const actual = typeof raw === 'string' ? Number(raw.trim().replace(',', '.')) : Number.NaN
      return Number.isFinite(actual) && Math.abs(actual - spec.value) <= spec.tolerance
    }
    case 'exact':
      return (
        typeof raw === 'string' &&
        (spec.caseSensitive
          ? raw.trim() === spec.value.trim()
          : raw.trim().toLocaleLowerCase('uk-UA') ===
            spec.value.trim().toLocaleLowerCase('uk-UA'))
      )
    case 'singleChoice':
      return typeof raw === 'string' && raw === spec.value
    case 'multipleChoice':
      return (
        Array.isArray(raw) &&
        new Set(raw).size === new Set(spec.values).size &&
        spec.values.every((value) => raw.includes(value))
      )
    case 'matching':
      return (
        !Array.isArray(raw) &&
        typeof raw === 'object' &&
        Object.entries(spec.pairs).every(([left, right]) => raw[left] === right)
      )
    case 'stepByStep':
      return (
        Array.isArray(raw) &&
        raw.length === spec.steps.length &&
        spec.steps.every((step, index) =>
          step.strategy === 'exact'
            ? raw[index]?.trim() === step.value.trim()
            : areEquivalentAnswers(raw[index] ?? '', step.value),
        )
      )
  }
}

export function normalizeExerciseAnswer(answer: ExerciseAnswer): ExerciseAnswer {
  if (typeof answer === 'string') return answer.trim().replace(',', '.')
  if (Array.isArray(answer)) return answer.map((entry) => entry.trim())
  return Object.fromEntries(
    Object.entries(answer)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, value.trim()]),
  )
}

export function snapshotExerciseAnswer(answer: ExerciseAnswer): ExerciseAnswer {
  if (typeof answer === 'string') return answer
  if (Array.isArray(answer)) return [...answer]
  return { ...answer }
}

export function isAnswerEmpty(answer: ExerciseAnswer): boolean {
  if (typeof answer === 'string') return answer.trim() === ''
  if (Array.isArray(answer)) return answer.length === 0 || answer.some((entry) => !entry.trim())
  const values = Object.values(answer)
  return values.length === 0 || values.some((entry) => !entry.trim())
}
