import type { StudentProfile } from '@/types/domain'

import { db } from '../db/database'

export interface CreateProfileInput {
  name: string
  avatarId: string
  examDate?: string
  dailyGoalMinutes: 10 | 15 | 20
  preferredStudyDays: number[]
}

export interface ProfileRepository {
  list(): Promise<StudentProfile[]>
  get(id: string): Promise<StudentProfile | undefined>
  create(input: CreateProfileInput): Promise<StudentProfile>
}

class DexieProfileRepository implements ProfileRepository {
  async list(): Promise<StudentProfile[]> {
    return db.profiles.orderBy('updatedAt').reverse().toArray()
  }

  async get(id: string): Promise<StudentProfile | undefined> {
    return db.profiles.get(id)
  }

  async create(input: CreateProfileInput): Promise<StudentProfile> {
    const now = new Date().toISOString()
    const profile: StudentProfile = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      avatarId: input.avatarId,
      dailyGoalMinutes: input.dailyGoalMinutes,
      preferredStudyDays: [...input.preferredStudyDays],
      createdAt: now,
      updatedAt: now,
      ...(input.examDate ? { examDate: input.examDate } : {}),
    }

    await db.transaction('rw', db.profiles, db.gamification, db.settings, async () => {
      await db.profiles.add(profile)
      await db.gamification.add({
        profileId: profile.id,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        streakFreezes: 1,
        unlockedAchievementIds: [],
        unlockedCosmeticIds: ['desk-pink-notebook'],
      })
      await db.settings.add({
        profileId: profile.id,
        soundEnabled: true,
        reducedMotion: false,
        highContrast: false,
        updatedAt: now,
      })
    })

    return profile
  }
}

export const profileRepository: ProfileRepository = new DexieProfileRepository()
