import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/infrastructure/db/database'

import { learningRepository } from './learningRepository'

beforeEach(async () => {
  await db.open()
  await db.transaction('rw', db.tables, () => Promise.all(db.tables.map((table) => table.clear())))
})

describe('learning repository completion', () => {
  it('is idempotent and awards lesson progress only once', async () => {
    const session = {
      id: 'session-1',
      profileId: 'profile-1',
      topicId: 'natural-numbers',
      type: 'lesson' as const,
      status: 'active' as const,
      startedAt: '2026-07-29T10:00:00.000Z',
      currentStage: 'practice',
      currentExerciseIndex: 0,
      exerciseSeeds: ['seed'],
      earnedXp: 0,
    }
    await db.sessions.add(session)
    await db.gamification.add({
      profileId: 'profile-1',
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      streakFreezes: 1,
      unlockedAchievementIds: [],
      unlockedCosmeticIds: [],
    })
    await db.attempts.add({
      id: 'attempt-1',
      profileId: 'profile-1',
      sessionId: session.id,
      exerciseId: 'exercise-1',
      templateId: 'template-1',
      seed: 'seed',
      topicId: 'natural-numbers',
      skillIds: ['basic-arithmetic'],
      prompt: '2 + 2',
      expectedAnswer: '4',
      submittedAnswer: '4',
      normalizedAnswer: '4',
      isCorrect: true,
      hintLevelUsed: 0,
      createdAt: '2026-07-29T10:01:00.000Z',
    })

    await learningRepository.completeLesson(session)
    await learningRepository.completeLesson(session)

    expect((await db.gamification.get('profile-1'))?.xp).toBe(40)
    expect((await db.topicProgress.get(['profile-1', 'natural-numbers']))?.attempts).toBe(1)
    expect(await db.reviewItems.count()).toBe(1)
  })
})
