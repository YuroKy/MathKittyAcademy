import { describe, expect, it } from 'vitest'

import type { ExerciseAttempt } from '@/types/domain'

import { parseRational } from './rational'
import { generateSimilarMistakeExercise } from './similarMistake'

const source: ExerciseAttempt = {
  id: 'attempt',
  profileId: 'profile',
  sessionId: 'session',
  exerciseId: 'exercise',
  templateId: 'template',
  seed: 'original-seed',
  topicId: 'fraction-addition-different',
  skillIds: ['add-unlike-fractions'],
  prompt: 'Обчисли 1/2 + 1/3 = ?',
  expectedAnswer: '5/6',
  submittedAnswer: '2/5',
  normalizedAnswer: '2/5',
  isCorrect: false,
  hintLevelUsed: 0,
  createdAt: '2026-07-29T10:00:00.000Z',
}

describe('similar mistake generation', () => {
  it('uses a new seed, new numbers and a mathematically correct answer', () => {
    const generated = generateSimilarMistakeExercise(source, 'stable-nonce')
    expect(generated?.seed).not.toBe(source.seed)
    expect(generated?.prompt).not.toBe(source.prompt)
    expect(generated?.expectedAnswer).not.toBe(source.expectedAnswer)
    expect(parseRational(generated?.expectedAnswer ?? '')).not.toBeNull()
  })

  it('is deterministic for the same nonce', () => {
    expect(generateSimilarMistakeExercise(source, 'same')).toEqual(
      generateSimilarMistakeExercise(source, 'same'),
    )
  })
})
