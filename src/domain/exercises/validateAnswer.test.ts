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

  it('compares multiple choice answers as sets without changing display order', () => {
    const exercise: ExerciseInstance = {
      ...base,
      kind: 'multipleChoice',
      choices: ['2', '3', '5', '7'],
      answerSpec: { kind: 'multipleChoice', values: ['2', '5'] },
    }
    expect(validateExerciseAnswer(exercise, ['5', '2'])).toBe(true)
    expect(validateExerciseAnswer(exercise, ['2', '3'])).toBe(false)
  })

  it('validates matching pairs and independently validated steps', () => {
    expect(
      validateExerciseAnswer(
        {
          ...base,
          kind: 'matching',
          answerSpec: { kind: 'matching', pairs: { '1/2': '2/4', '2/3': '4/6' } },
        },
        { '2/3': '4/6', '1/2': '2/4' },
      ),
    ).toBe(true)
    expect(
      validateExerciseAnswer(
        {
          ...base,
          kind: 'stepByStep',
          answerSpec: {
            kind: 'stepByStep',
            steps: [
              { value: '1/2', strategy: 'rational' },
              { value: '0.5', strategy: 'rational' },
            ],
          },
        },
        ['2/4', '1/2'],
      ),
    ).toBe(true)
  })
})
