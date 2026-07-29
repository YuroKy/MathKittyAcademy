import { describe, expect, it } from 'vitest'

import type { ExerciseInstance } from '@/types/domain'

import { validateExerciseAnswer } from './validateAnswer'

const base: ExerciseInstance = {
  id: 'exercise',
  templateId: 'template',
  seed: 'seed',
  topicId: 'topic',
  skillIds: ['skill'],
  difficulty: 1,
  kind: 'numericInput',
  prompt: 'Prompt',
  expectedAnswer: '0.333',
  hints: [],
  solutionSteps: [],
}

describe('exercise answer strategies', () => {
  it('supports explicit decimal tolerance', () => {
    expect(
      validateExerciseAnswer(
        { ...base, validationStrategy: 'decimalTolerance', tolerance: 0.01 },
        '0,33',
      ),
    ).toBe(true)
  })

  it('supports exact choice validation', () => {
    expect(
      validateExerciseAnswer(
        { ...base, expectedAnswer: 'Парабола', validationStrategy: 'choice' },
        'парабола',
      ),
    ).toBe(true)
  })
})
