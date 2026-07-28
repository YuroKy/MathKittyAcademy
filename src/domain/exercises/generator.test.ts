import { describe, expect, it } from 'vitest'

import { grade5Lessons } from '@/content/lessons/grade5Lessons'

import { buildLessonExerciseSet, generateNaturalNumbersExercise } from './generator'

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

  it('builds a resumable exercise set from authored lesson material', () => {
    const lesson = grade5Lessons['division-with-remainder']
    const first = buildLessonExerciseSet(lesson, 'session:grade5')
    const resumed = buildLessonExerciseSet(lesson, 'session:grade5')

    expect(first).toEqual(resumed)
    expect(first).toHaveLength(3)
    expect(first.every((exercise) => exercise.topicId === lesson.topicId)).toBe(true)
    expect(first.map((exercise) => exercise.seed)).toHaveLength(3)
  })
})
