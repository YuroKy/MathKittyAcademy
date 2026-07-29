import type { ExerciseInstance } from '@/types/domain'

import { areEquivalentAnswers } from './rational'

export function validateExerciseAnswer(exercise: ExerciseInstance, raw: string): boolean {
  const actual = raw.trim().replace(',', '.')
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
