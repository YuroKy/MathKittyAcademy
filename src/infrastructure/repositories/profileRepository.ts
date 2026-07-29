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
  update(id: string, changes: Partial<Pick<StudentProfile, 'name' | 'dailyGoalMinutes' | 'preferredStudyDays' | 'avatarId' | 'examDate' | 'diagnosticCompletedAt' | 'diagnosticSkippedAt'>>): Promise<StudentProfile>
  delete(id: string): Promise<void>
  resetProgress(id: string): Promise<void>
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
        reducedMotion:
          typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: false,
        updatedAt: now,
      })
    })

    return profile
  }

  async update(
    id: string,
    changes: Partial<
      Pick<
        StudentProfile,
        | 'name'
        | 'dailyGoalMinutes'
        | 'preferredStudyDays'
        | 'avatarId'
        | 'examDate'
        | 'diagnosticCompletedAt'
        | 'diagnosticSkippedAt'
      >
    >,
  ): Promise<StudentProfile> {
    const profile = await db.profiles.get(id)
    if (!profile) throw new Error('Профіль не знайдено.')
    const updated = {
      ...profile,
      ...changes,
      ...(changes.name ? { name: changes.name.trim() } : {}),
      updatedAt: new Date().toISOString(),
    }
    await db.profiles.put(updated)
    return updated
  }

  async resetProgress(id: string): Promise<void> {
    await db.transaction('rw', db.tables, async () => {
      await Promise.all([
        db.topicProgress.where('profileId').equals(id).delete(),
        db.skillProgress.where('profileId').equals(id).delete(),
        db.sessions.where('profileId').equals(id).delete(),
        db.attempts.where('profileId').equals(id).delete(),
        db.reviewItems.where('profileId').equals(id).delete(),
        db.mistakes.where('profileId').equals(id).delete(),
        db.activityDays.where('profileId').equals(id).delete(),
      ])
      await db.gamification.put({
        profileId: id,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        streakFreezes: 1,
        unlockedAchievementIds: [],
        unlockedCosmeticIds: ['desk-pink-notebook'],
      })
    })
  }

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.tables, async () => {
      await Promise.all([
        db.topicProgress.where('profileId').equals(id).delete(),
        db.skillProgress.where('profileId').equals(id).delete(),
        db.sessions.where('profileId').equals(id).delete(),
        db.attempts.where('profileId').equals(id).delete(),
        db.reviewItems.where('profileId').equals(id).delete(),
        db.mistakes.where('profileId').equals(id).delete(),
        db.activityDays.where('profileId').equals(id).delete(),
        db.profiles.delete(id),
        db.gamification.delete(id),
        db.settings.delete(id),
      ])
    })
  }
}

export const profileRepository: ProfileRepository = new DexieProfileRepository()
