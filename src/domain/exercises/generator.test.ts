import { describe, expect, it } from 'vitest'

import { generateNaturalNumbersExercise } from './generator'

describe('deterministic exercise generator', () => {
  it('returns the same task for the same template and seed', () => {
    const first = generateNaturalNumbersExercise('addition', 'session:1')
    const resumed = generateNaturalNumbersExercise('addition', 'session:1')

    expect(resumed).toEqual(first)
  })

  it('keeps template identity in the exercise instance', () => {
    const exercise = generateNaturalNumbersExercise('multiplication', 'stable-seed')

    expect(exercise.id).toBe('multiplication:stable-seed')
    expect(exercise.skillIds).toEqual(['multiplication'])
    expect(Number(exercise.expectedAnswer)).toBeGreaterThan(0)
  })
})
