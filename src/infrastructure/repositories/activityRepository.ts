import { appConfig } from '@/content/config'
import { calendarDayDistance, localDateKey } from '@/domain/activity/localDate'

import { db } from '../db/database'

class ActivityRepository {
  async addActiveSeconds(profileId: string, seconds: number, at = new Date()): Promise<void> {
    if (!Number.isFinite(seconds) || seconds <= 0) return
    const localDate = localDateKey(at)
    await db.transaction('rw', db.activityDays, db.profiles, db.gamification, async () => {
      const [current, profile, gamification] = await Promise.all([
        db.activityDays.get([profileId, localDate]),
        db.profiles.get(profileId),
        db.gamification.get(profileId),
      ])
      if (!profile || !gamification) return
      const activeSeconds = (current?.activeSeconds ?? 0) + Math.min(Math.round(seconds), 60)
      let dailyGoalAwarded = current?.dailyGoalAwarded ?? false
      if (!dailyGoalAwarded && activeSeconds >= profile.dailyGoalMinutes * 60) {
        dailyGoalAwarded = true
        const distance = gamification.lastGoalDate
          ? calendarDayDistance(gamification.lastGoalDate, localDate)
          : undefined
        let currentStreak = 1
        let streakFreezes = gamification.streakFreezes
        if (distance === 0) currentStreak = gamification.currentStreak
        else if (distance === 1) currentStreak = gamification.currentStreak + 1
        else if (distance === 2 && streakFreezes > 0) {
          currentStreak = gamification.currentStreak + 1
          streakFreezes -= 1
        }
        const unlocked = [...gamification.unlockedAchievementIds]
        const completedStudyDays =
          (await db.activityDays
            .where('profileId')
            .equals(profileId)
            .filter((day) => day.dailyGoalAwarded)
            .count()) + 1
        if (completedStudyDays >= 3 && !unlocked.includes('three-study-days')) {
          unlocked.push('three-study-days')
        }
        if (currentStreak >= 7 && !unlocked.includes('seven-day-streak')) unlocked.push('seven-day-streak')
        const xp = gamification.xp + appConfig.xp.dailyGoal
        await db.gamification.put({
          ...gamification,
          xp,
          level: Math.floor(xp / 100) + 1,
          currentStreak,
          longestStreak: Math.max(gamification.longestStreak, currentStreak),
          lastGoalDate: localDate,
          streakFreezes,
          unlockedAchievementIds: unlocked,
        })
      }
      await db.activityDays.put({
        profileId,
        localDate,
        activeSeconds,
        completedSessions: current?.completedSessions ?? 0,
        dailyGoalAwarded,
        updatedAt: at.toISOString(),
      })
    })
  }

  async recordSessionCompleted(profileId: string, at = new Date()): Promise<void> {
    const localDate = localDateKey(at)
    const current = await db.activityDays.get([profileId, localDate])
    await db.activityDays.put({
      profileId,
      localDate,
      activeSeconds: current?.activeSeconds ?? 0,
      completedSessions: (current?.completedSessions ?? 0) + 1,
      dailyGoalAwarded: current?.dailyGoalAwarded ?? false,
      updatedAt: at.toISOString(),
    })
  }
}

export const activityRepository = new ActivityRepository()
