import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/infrastructure/db/database'

import { activityRepository } from './activityRepository'

beforeEach(async () => {
  await db.open()
  await db.transaction('rw', db.tables, () => Promise.all(db.tables.map((table) => table.clear())))
  await db.profiles.add({
    id: 'profile',
    name: 'Марта',
    avatarId: 'cat',
    dailyGoalMinutes: 10,
    preferredStudyDays: [],
    createdAt: '2026-07-29T00:00:00.000Z',
    updatedAt: '2026-07-29T00:00:00.000Z',
  })
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
})

describe('daily activity and streak', () => {
  it('awards a daily goal once and uses one freeze for one missed day', async () => {
    for (let index = 0; index < 10; index += 1) {
      await activityRepository.addActiveSeconds('profile', 60, new Date(2026, 6, 27, 12))
    }
    for (let index = 0; index < 10; index += 1) {
      await activityRepository.addActiveSeconds('profile', 60, new Date(2026, 6, 29, 12))
    }
    await activityRepository.addActiveSeconds('profile', 60, new Date(2026, 6, 29, 13))

    const gamification = await db.gamification.get('profile')
    expect(gamification?.xp).toBe(30)
    expect(gamification?.currentStreak).toBe(2)
    expect(gamification?.streakFreezes).toBe(0)
  })
})
