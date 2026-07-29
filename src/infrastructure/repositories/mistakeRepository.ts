import type { ExerciseAttempt, MistakeRecord } from '@/types/domain'

import { db } from '../db/database'

export interface MistakeDetails {
  mistake: MistakeRecord
  attempt?: ExerciseAttempt
}

class MistakeRepository {
  async list(profileId: string): Promise<MistakeDetails[]> {
    const mistakes = await db.mistakes.where('profileId').equals(profileId).reverse().sortBy('createdAt')
    const attempts = await db.attempts.bulkGet(mistakes.map((item) => item.attemptId))
    return mistakes.map((mistake, index) => ({ mistake, attempt: attempts[index] }))
  }

  async resolve(profileId: string, mistakeId: string, resolvedAttemptId?: string): Promise<void> {
    await db.transaction('rw', db.mistakes, db.gamification, async () => {
      const mistake = await db.mistakes.get(mistakeId)
      if (!mistake || mistake.profileId !== profileId || mistake.resolved) return
      const now = new Date().toISOString()
      await db.mistakes.update(mistakeId, {
        resolved: true,
        resolvedAt: now,
        resolvedAttemptId,
      })
      const resolvedCount = await db.mistakes
        .where('profileId')
        .equals(profileId)
        .filter((entry) => entry.resolved)
        .count()
      const gamification = await db.gamification.get(profileId)
      if (gamification) {
        const unlocked = [...gamification.unlockedAchievementIds]
        if (!unlocked.includes('first-corrected-mistake')) unlocked.push('first-corrected-mistake')
        if (resolvedCount >= 10 && !unlocked.includes('ten-corrected-mistakes')) {
          unlocked.push('ten-corrected-mistakes')
        }
        await db.gamification.put({
          ...gamification,
          xp: gamification.xp + 10,
          level: Math.floor((gamification.xp + 10) / 100) + 1,
          unlockedAchievementIds: unlocked,
        })
      }
    })
  }
}

export const mistakeRepository = new MistakeRepository()
