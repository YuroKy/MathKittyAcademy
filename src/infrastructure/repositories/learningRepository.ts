import { appConfig } from '@/content/config'
import { updateMastery } from '@/domain/mastery/updateMastery'
import { scheduleNextReview } from '@/domain/review/schedule'
import type {
  ExerciseAttempt,
  GamificationState,
  LearningSession,
  ReviewItem,
  TopicProgress,
} from '@/types/domain'

import { db } from '../db/database'

export interface RecordAttemptInput {
  profileId: string
  sessionId: string
  exerciseId: string
  templateId: string
  seed: string
  skillIds: string[]
  submittedAnswer: string
  normalizedAnswer: string
  isCorrect: boolean
  hintLevelUsed: number
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

  async findActiveLesson(
    profileId: string,
    topicId: string,
  ): Promise<LearningSession | undefined> {
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
  ): Promise<void> {
    await db.sessions.update(sessionId, {
      currentStage,
      currentExerciseIndex,
      exerciseSeeds,
    })
  }

  async recordAttempt(input: RecordAttemptInput): Promise<ExerciseAttempt> {
    const attempt: ExerciseAttempt = {
      id: crypto.randomUUID(),
      profileId: input.profileId,
      sessionId: input.sessionId,
      exerciseId: input.exerciseId,
      templateId: input.templateId,
      seed: input.seed,
      skillIds: [...input.skillIds],
      submittedAnswer: input.submittedAnswer,
      normalizedAnswer: input.normalizedAnswer,
      isCorrect: input.isCorrect,
      hintLevelUsed: input.hintLevelUsed,
      errorType: input.isCorrect ? undefined : 'calculationError',
      createdAt: new Date().toISOString(),
    }

    await db.attempts.add(attempt)
    return attempt
  }

  async completeLesson(session: LearningSession): Promise<void> {
    if (!session.topicId) throw new Error('У навчальній сесії відсутня тема.')

    const attempts = (await db.attempts.where('sessionId').equals(session.id).toArray()).sort(
      (left, right) => left.createdAt.localeCompare(right.createdAt),
    )
    const latestByExercise = new Map<string, ExerciseAttempt>()
    for (const attempt of attempts) latestByExercise.set(attempt.exerciseId, attempt)

    const latestAttempts = [...latestByExercise.values()]
    const correct = latestAttempts.filter((attempt) => attempt.isCorrect).length
    const existingProgress = await db.topicProgress.get([session.profileId, session.topicId])
    let mastery = existingProgress?.mastery ?? 0
    for (const attempt of latestAttempts) {
      mastery = updateMastery(mastery, {
        isCorrect: attempt.isCorrect,
        hintLevelUsed: attempt.hintLevelUsed,
        independent: true,
      }).next
    }

    if (latestAttempts.length > 0 && correct / latestAttempts.length >= 2 / 3) {
      mastery = Math.max(60, mastery)
    }

    const now = new Date()
    const nowIso = now.toISOString()
    const status = mastery >= appConfig.masteryThresholds.masteredMin ? 'mastered' : 'inProgress'
    const currentGamification = await db.gamification.get(session.profileId)
    const earnedXp = appConfig.xp.lessonCompleted
    const nextXp = (currentGamification?.xp ?? 0) + earnedXp
    const level = Math.floor(nextXp / 100) + 1
    const skillIds = [...new Set(latestAttempts.flatMap((attempt) => attempt.skillIds))]

    await db.transaction(
      'rw',
      [
        db.sessions,
        db.topicProgress,
        db.gamification,
        db.reviewItems,
        db.mistakes,
      ],
      async () => {
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

        await db.gamification.put({
          profileId: session.profileId,
          xp: nextXp,
          level,
          currentStreak: currentGamification?.currentStreak ?? 0,
          longestStreak: currentGamification?.longestStreak ?? 0,
          streakFreezes: currentGamification?.streakFreezes ?? 1,
          unlockedAchievementIds: [
            ...new Set([
              ...(currentGamification?.unlockedAchievementIds ?? []),
              'first-lesson-completed',
            ]),
          ],
          unlockedCosmeticIds: currentGamification?.unlockedCosmeticIds ?? [
            'desk-pink-notebook',
          ],
        })

        for (const skillId of skillIds) {
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

        for (const attempt of latestAttempts.filter((entry) => !entry.isCorrect)) {
          await db.mistakes.add({
            id: crypto.randomUUID(),
            profileId: session.profileId,
            attemptId: attempt.id,
            topicId: session.topicId!,
            skillIds: attempt.skillIds,
            errorType: attempt.errorType ?? 'unknown',
            resolved: false,
            createdAt: attempt.createdAt,
          })
        }
      },
    )
  }
}

export const learningRepository = new LearningRepository()
