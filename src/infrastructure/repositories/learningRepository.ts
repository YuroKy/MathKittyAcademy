import { appConfig } from '@/content/config'
import { localDateKey } from '@/domain/activity/localDate'
import { classifyExerciseError, errorExplanationKeys } from '@/domain/exercises/classifyError'
import { updateMastery } from '@/domain/mastery/updateMastery'
import { scheduleNextReview } from '@/domain/review/schedule'
import type {
  ExerciseAttempt,
  GamificationState,
  LearningSession,
  ReviewItem,
  SkillProgress,
  TopicProgress,
} from '@/types/domain'

import { db } from '../db/database'

export interface RecordAttemptInput {
  profileId: string
  sessionId: string
  exerciseId: string
  templateId: string
  seed: string
  topicId: string
  skillIds: string[]
  prompt: string
  expectedAnswer: string
  submittedAnswer: string
  normalizedAnswer: string
  isCorrect: boolean
  hintLevelUsed: number
}

export interface LearningStats {
  completedLessons: number
  correctAttempts: number
  totalAttempts: number
  studyMinutes: number
  weeklyMinutes: number[]
  firstAttemptAccuracy: number
  finalCompletionRate: number
  hintedCorrectAttempts: number
  reviewAccuracy: number
  commonErrorTypes: Array<{ type: string; count: number }>
}

class LearningRepository {
  async listTopicProgress(profileId: string): Promise<TopicProgress[]> {
    return db.topicProgress.where('profileId').equals(profileId).toArray()
  }

  async getGamification(profileId: string): Promise<GamificationState | undefined> {
    return db.gamification.get(profileId)
  }

  async countDueReviews(profileId: string, at = new Date()): Promise<number> {
    const items = await db.reviewItems.where('profileId').equals(profileId).toArray()
    return items.filter((item) => item.dueAt <= at.toISOString()).length
  }

  async getLearningStats(profileId: string, at = new Date()): Promise<LearningStats> {
    const [sessions, attempts, activityDays, mistakes] = await Promise.all([
      db.sessions.where('profileId').equals(profileId).toArray(),
      db.attempts.where('profileId').equals(profileId).toArray(),
      db.activityDays.where('profileId').equals(profileId).toArray(),
      db.mistakes.where('profileId').equals(profileId).toArray(),
    ])
    const completedLessons = sessions.filter(
      (session) => session.type === 'lesson' && session.status === 'completed',
    )
    const startOfToday = new Date(at)
    startOfToday.setHours(0, 0, 0, 0)
    const weekDates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfToday)
      date.setDate(startOfToday.getDate() - (6 - index))
      return date
    })
    const activityMap = new Map(activityDays.map((day) => [day.localDate, day]))
    const weeklyMinutes = weekDates.map((date) => {
      const dayKey = localDateKey(date)
      return Math.round((activityMap.get(dayKey)?.activeSeconds ?? 0) / 60)
    })
    const attemptsByExercise = new Map<string, ExerciseAttempt[]>()
    for (const attempt of attempts) {
      const key = `${attempt.sessionId}:${attempt.exerciseId}`
      attemptsByExercise.set(key, [...(attemptsByExercise.get(key) ?? []), attempt])
    }
    const groups = [...attemptsByExercise.values()].map((entries) =>
      entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    )
    const firstCorrect = groups.filter((entries) => entries[0]?.isCorrect).length
    const finalCorrect = groups.filter((entries) => entries.at(-1)?.isCorrect).length
    const reviewAttempts = attempts.filter((attempt) =>
      sessions.some((session) => session.id === attempt.sessionId && session.type === 'review'),
    )
    const errorCounts = new Map<string, number>()
    for (const mistake of mistakes) {
      errorCounts.set(mistake.errorType, (errorCounts.get(mistake.errorType) ?? 0) + 1)
    }

    return {
      completedLessons: completedLessons.length,
      correctAttempts: attempts.filter((attempt) => attempt.isCorrect).length,
      totalAttempts: attempts.length,
      studyMinutes: Math.round(
        activityDays.reduce((total, day) => total + day.activeSeconds, 0) / 60,
      ),
      weeklyMinutes,
      firstAttemptAccuracy: groups.length ? Math.round((firstCorrect / groups.length) * 100) : 0,
      finalCompletionRate: groups.length ? Math.round((finalCorrect / groups.length) * 100) : 0,
      hintedCorrectAttempts: attempts.filter(
        (attempt) => attempt.isCorrect && attempt.hintLevelUsed > 0,
      ).length,
      reviewAccuracy: reviewAttempts.length
        ? Math.round(
            (reviewAttempts.filter((attempt) => attempt.isCorrect).length / reviewAttempts.length) *
              100,
          )
        : 0,
      commonErrorTypes: [...errorCounts.entries()]
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    }
  }

  async findActiveLesson(profileId: string, topicId: string): Promise<LearningSession | undefined> {
    const sessions = await db.sessions
      .where('[profileId+topicId]')
      .equals([profileId, topicId])
      .toArray()

    return sessions
      .filter((session) => session.status === 'active' && session.type === 'lesson')
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt))[0]
  }

  async startLesson(profileId: string, topicId: string): Promise<LearningSession> {
    const existing = await this.findActiveLesson(profileId, topicId)
    if (existing) return existing

    const session: LearningSession = {
      id: crypto.randomUUID(),
      profileId,
      topicId,
      type: 'lesson',
      status: 'active',
      startedAt: new Date().toISOString(),
      currentStage: 'introduction',
      currentExerciseIndex: 0,
      exerciseSeeds: [],
      earnedXp: 0,
    }
    await db.sessions.add(session)
    return session
  }

  async saveLessonPosition(
    sessionId: string,
    currentStage: string,
    currentExerciseIndex: number,
    exerciseSeeds: string[],
    interactionState?: Record<string, unknown>,
  ): Promise<void> {
    await db.sessions.update(sessionId, {
      currentStage,
      currentExerciseIndex,
      exerciseSeeds,
      ...(interactionState ? { interactionState } : {}),
    })
  }

  async recordAttempt(input: RecordAttemptInput): Promise<ExerciseAttempt> {
    const existingAttempts = await db.attempts
      .where('sessionId')
      .equals(input.sessionId)
      .filter(
        (entry) =>
          entry.exerciseId === input.exerciseId &&
          entry.normalizedAnswer === input.normalizedAnswer &&
          entry.hintLevelUsed === input.hintLevelUsed,
      )
      .toArray()
    const existing = existingAttempts.at(-1)
    if (existing) return existing

    const errorType = input.isCorrect
      ? undefined
      : classifyExerciseError(input.normalizedAnswer, input.expectedAnswer, input.topicId)
    const attempt: ExerciseAttempt = {
      id: crypto.randomUUID(),
      profileId: input.profileId,
      sessionId: input.sessionId,
      exerciseId: input.exerciseId,
      templateId: input.templateId,
      seed: input.seed,
      topicId: input.topicId,
      skillIds: [...input.skillIds],
      prompt: input.prompt,
      expectedAnswer: input.expectedAnswer,
      submittedAnswer: input.submittedAnswer,
      normalizedAnswer: input.normalizedAnswer,
      isCorrect: input.isCorrect,
      hintLevelUsed: input.hintLevelUsed,
      errorType,
      createdAt: new Date().toISOString(),
    }

    await db.transaction('rw', db.attempts, db.mistakes, async () => {
      await db.attempts.add(attempt)
      if (!attempt.isCorrect) {
        const duplicate = await db.mistakes
          .where('profileId')
          .equals(input.profileId)
          .filter(
            (entry) =>
              entry.attemptId === attempt.id ||
              (entry.topicId === input.topicId &&
                entry.createdAt === attempt.createdAt &&
                entry.skillIds.join('|') === input.skillIds.join('|')),
          )
          .first()
        if (!duplicate) {
          await db.mistakes.add({
            id: crypto.randomUUID(),
            profileId: input.profileId,
            attemptId: attempt.id,
            topicId: input.topicId,
            skillIds: [...input.skillIds],
            errorType: errorType ?? 'unknown',
            explanationKey: errorExplanationKeys[errorType ?? 'unknown'],
            resolved: false,
            createdAt: attempt.createdAt,
          })
        }
      }
    })
    return attempt
  }

  async completeLesson(session: LearningSession): Promise<void> {
    if (!session.topicId) throw new Error('У навчальній сесії відсутня тема.')

    await db.transaction(
      'rw',
      [db.sessions, db.attempts, db.topicProgress, db.skillProgress, db.gamification, db.reviewItems],
      async () => {
        const storedSession = await db.sessions.get(session.id)
        if (!storedSession) throw new Error('Навчальну сесію не знайдено.')
        if (storedSession.status === 'completed') return

        const attempts = (await db.attempts.where('sessionId').equals(session.id).toArray()).sort(
          (left, right) => left.createdAt.localeCompare(right.createdAt),
        )
        const latestByExercise = new Map<string, ExerciseAttempt>()
        for (const attempt of attempts) latestByExercise.set(attempt.exerciseId, attempt)
        const latestAttempts = [...latestByExercise.values()]
        const correct = latestAttempts.filter((attempt) => attempt.isCorrect).length
        const existingProgress = await db.topicProgress.get([session.profileId, session.topicId!])
        let mastery = existingProgress?.mastery ?? 0
        for (const attempt of latestAttempts) {
          mastery = updateMastery(mastery, {
            isCorrect: attempt.isCorrect,
            hintLevelUsed: attempt.hintLevelUsed,
            independent: attempt.hintLevelUsed === 0,
          }).next
        }
        if (latestAttempts.length > 0 && correct / latestAttempts.length >= 2 / 3) {
          mastery = Math.max(60, mastery)
        }

        const now = new Date()
        const nowIso = now.toISOString()
        const status =
          mastery >= appConfig.masteryThresholds.masteredMin ? 'mastered' : 'inProgress'
        const currentGamification = await db.gamification.get(session.profileId)
        const newlyMastered = status === 'mastered' && existingProgress?.status !== 'mastered'
        const earnedXp =
          appConfig.xp.lessonCompleted + (newlyMastered ? appConfig.xp.topicMastered : 0)
        const nextXp = (currentGamification?.xp ?? 0) + earnedXp
        const level = Math.floor(nextXp / 100) + 1
        const skillIds = [...new Set(latestAttempts.flatMap((attempt) => attempt.skillIds))]

        await db.sessions.update(session.id, {
          status: 'completed',
          completedAt: nowIso,
          currentStage: 'summary',
          earnedXp,
        })

        await db.topicProgress.put({
          profileId: session.profileId,
          topicId: session.topicId!,
          mastery,
          status,
          attempts: (existingProgress?.attempts ?? 0) + latestAttempts.length,
          independentCorrect: (existingProgress?.independentCorrect ?? 0) + correct,
          lastPracticedAt: nowIso,
          ...(status === 'mastered' ? { masteredAt: nowIso } : {}),
        })

        const unlockedAchievementIds = [
          ...new Set([
            ...(currentGamification?.unlockedAchievementIds ?? []),
            'first-lesson-completed',
            ...(newlyMastered ? ['first-topic-mastered'] : []),
          ]),
        ]
        if (
          status === 'mastered' &&
          (await db.topicProgress
            .where('profileId')
            .equals(session.profileId)
            .filter((entry) => entry.status === 'mastered')
            .count()) >= 5 &&
          !unlockedAchievementIds.includes('five-topics-mastered')
        ) {
          unlockedAchievementIds.push('five-topics-mastered')
        }
        await db.gamification.put({
          profileId: session.profileId,
          xp: nextXp,
          level,
          currentStreak: currentGamification?.currentStreak ?? 0,
          longestStreak: currentGamification?.longestStreak ?? 0,
          streakFreezes: currentGamification?.streakFreezes ?? 1,
          unlockedAchievementIds,
          unlockedCosmeticIds: currentGamification?.unlockedCosmeticIds ?? ['desk-pink-notebook'],
        })

        for (const skillId of skillIds) {
          const relevant = latestAttempts.filter((attempt) => attempt.skillIds.includes(skillId))
          const existingSkill = await db.skillProgress.get([session.profileId, skillId])
          let skillMastery = existingSkill?.mastery ?? 0
          for (const attempt of relevant) {
            skillMastery = updateMastery(skillMastery, {
              isCorrect: attempt.isCorrect,
              hintLevelUsed: attempt.hintLevelUsed,
              independent: attempt.hintLevelUsed === 0,
            }).next
          }
          const skillProgress: SkillProgress = {
            profileId: session.profileId,
            skillId,
            mastery: skillMastery,
            attempts: (existingSkill?.attempts ?? 0) + relevant.length,
            correctAttempts:
              (existingSkill?.correctAttempts ?? 0) + relevant.filter((entry) => entry.isCorrect).length,
            hintedCorrectAttempts:
              (existingSkill?.hintedCorrectAttempts ?? 0) +
              relevant.filter((entry) => entry.isCorrect && entry.hintLevelUsed > 0).length,
            lastPracticedAt: nowIso,
          }
          await db.skillProgress.put(skillProgress)

          const existingReview = await db.reviewItems.get(`${session.profileId}:${skillId}`)
          if (!existingReview) {
            const scheduled = scheduleNextReview(now, 0, 'correct')
            const item: ReviewItem = {
              id: `${session.profileId}:${skillId}`,
              profileId: session.profileId,
              skillId,
              intervalStep: scheduled.intervalStep,
              dueAt: scheduled.dueAt,
              lastResult: 'correct',
            }
            await db.reviewItems.put(item)
          }
        }
      },
    )
  }
}

export const learningRepository = new LearningRepository()
