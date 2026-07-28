import { describe, expect, it } from 'vitest'

import { buildFractionMeaningExerciseSet, generateFractionMeaningExercise } from './generator'

describe('fraction meaning exercise generator', () => {
  it('is deterministic for a stable seed', () => {
    expect(generateFractionMeaningExercise('lesson', 0)).toEqual(
      generateFractionMeaningExercise('lesson', 0),
    )
  })

  it('creates three reproducible fraction-input exercises', () => {
    const exercises = buildFractionMeaningExerciseSet('session')

    expect(exercises).toHaveLength(3)
    expect(exercises.every((exercise) => exercise.kind === 'fractionInput')).toBe(true)
    expect(exercises.at(-1)?.expectedAnswer).toBe('1/2')
  })
})
