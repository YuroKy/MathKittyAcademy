import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/infrastructure/db/database'

import { reviewRepository } from './reviewRepository'

beforeEach(async () => {
  await db.open()
  await db.transaction('rw', db.tables, () => Promise.all(db.tables.map((table) => table.clear())))
})

describe('review repository', () => {
  it('advances a successful review once and remains idempotent', async () => {
    await db.gamification.add({
      profileId: 'profile',
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      streakFreezes: 1,
      unlockedAchievementIds: [],
      unlockedCosmeticIds: [],
    })
    await db.reviewItems.add({
      id: 'profile:place-value',
      profileId: 'profile',
      skillId: 'place-value',
      intervalStep: 1,
      dueAt: '2020-01-01T00:00:00.000Z',
    })
    const { session, exercises } = await reviewRepository.start('profile')
    expect(exercises).toHaveLength(1)
    await db.attempts.add({
      id: 'attempt',
      profileId: 'profile',
      sessionId: session.id,
      exerciseId: exercises[0]!.id,
      templateId: exercises[0]!.templateId,
      seed: exercises[0]!.seed,
      topicId: exercises[0]!.topicId,
      skillIds: exercises[0]!.skillIds,
      prompt: exercises[0]!.prompt,
      expectedAnswer: exercises[0]!.expectedAnswer,
      submittedAnswer: exercises[0]!.expectedAnswer,
      normalizedAnswer: exercises[0]!.expectedAnswer,
      isCorrect: true,
      hintLevelUsed: 0,
      createdAt: '2026-07-29T10:00:00.000Z',
    })

    await reviewRepository.complete(session.id)
    await reviewRepository.complete(session.id)

    expect((await db.reviewItems.get('profile:place-value'))?.intervalStep).toBe(2)
    expect((await db.gamification.get('profile'))?.xp).toBe(25)
  })
})
