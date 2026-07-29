import { appConfig } from '@/content/config'
import { buildDiagnosticExercise } from '@/content/diagnostic/diagnosticExercises'
import { fullLessons } from '@/content/lessons/fullLessons'
import { updateMastery } from '@/domain/mastery/updateMastery'
import { scheduleNextReview } from '@/domain/review/schedule'
import type { ExerciseAttempt, ExerciseInstance, LearningSession } from '@/types/domain'

import { db } from '../db/database'

function exerciseForSkill(skillId: string, sessionId: string, index: number): ExerciseInstance | undefined {
  for (const lesson of Object.values(fullLessons)) {
    const template = lesson.exercises.find((entry) => entry.skillIds.includes(skillId))
    if (!template) continue
    return {
      ...template,
      id: `${sessionId}:review:${index}`,
      seed: `${sessionId}:${skillId}:${index}`,
      topicId: lesson.topicId,
    }
  }
  const fallback = buildDiagnosticExercise(`${skillId}:1`, sessionId)
  return fallback
    ? { ...fallback, id: `${sessionId}:review:${index}`, seed: `${sessionId}:${skillId}:${index}` }
    : undefined
}

class ReviewRepository {
  async listDue(profileId: string, at = new Date()): Promise<ExerciseInstance[]> {
    const items = (await db.reviewItems.where('profileId').equals(profileId).toArray())
      .filter((item) => item.dueAt <= at.toISOString())
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
      .slice(0, 10)
    return items
      .map((item, index) => exerciseForSkill(item.skillId, `preview-${profileId}`, index))
      .filter((item): item is ExerciseInstance => item !== undefined)
  }

  async start(profileId: string): Promise<{ session: LearningSession; exercises: ExerciseInstance[] }> {
    const active = (
      await db.sessions.where('[profileId+status]').equals([profileId, 'active']).toArray()
    ).find((session) => session.type === 'review')
    if (active) return { session: active, exercises: this.restoreExercises(active) }

    const dueItems = (await db.reviewItems.where('profileId').equals(profileId).toArray())
      .filter((item) => item.dueAt <= new Date().toISOString())
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
      .slice(0, 10)
    const session: LearningSession = {
      id: crypto.randomUUID(),
      profileId,
      type: 'review',
      status: 'active',
      startedAt: new Date().toISOString(),
      currentStage: 'practice',
      currentExerciseIndex: 0,
      exerciseSeeds: dueItems.map((item, index) => `${item.skillId}:${index}`),
      progressState: {
        kind: 'review',
        exerciseIndex: 0,
        reviewItemIds: dueItems.map((item) => item.id),
        exerciseSeeds: dueItems.map((item, index) => `${item.skillId}:${index}`),
      },
      earnedXp: 0,
    }
    if (dueItems.length === 0) return { session, exercises: [] }
    await db.sessions.add(session)
    return { session, exercises: this.restoreExercises(session) }
  }

  restoreExercises(session: LearningSession): ExerciseInstance[] {
    if (session.progressState?.kind !== 'review') return []
    return session.progressState.reviewItemIds
      .map((id, index) => {
        const skillId = id.slice(id.indexOf(':') + 1)
        return exerciseForSkill(skillId, session.id, index)
      })
      .filter((item): item is ExerciseInstance => item !== undefined)
  }

  async savePosition(session: LearningSession, exerciseIndex: number): Promise<void> {
    if (session.progressState?.kind !== 'review') return
    session.currentExerciseIndex = exerciseIndex
    const progressState = {
      kind: 'review' as const,
      exerciseIndex,
      reviewItemIds: [...session.progressState.reviewItemIds],
      exerciseSeeds: [...session.progressState.exerciseSeeds],
    }
    session.progressState = progressState
    await db.sessions.update(session.id, {
      currentExerciseIndex: exerciseIndex,
      progressState,
    })
  }

  async complete(sessionId: string): Promise<void> {
    await db.transaction(
      'rw',
      [db.sessions, db.attempts, db.reviewItems, db.skillProgress, db.topicProgress, db.gamification],
      async () => {
        const session = await db.sessions.get(sessionId)
        if (!session) throw new Error('Сесію повторення не знайдено.')
        if (session.status === 'completed') return
        const attempts = await db.attempts.where('sessionId').equals(sessionId).toArray()
        const latest = new Map<string, ExerciseAttempt>()
        attempts.forEach((attempt) => latest.set(attempt.exerciseId, attempt))
        const now = new Date()
        const nowIso = now.toISOString()

        for (const attempt of latest.values()) {
          for (const skillId of attempt.skillIds) {
            const item = await db.reviewItems.get(`${session.profileId}:${skillId}`)
            if (!item) continue
            const result = attempt.isCorrect ? 'correct' : 'incorrect'
            const scheduled = scheduleNextReview(now, item.intervalStep, result)
            await db.reviewItems.put({
              ...item,
              intervalStep: scheduled.intervalStep,
              dueAt: scheduled.dueAt,
              lastReviewedAt: nowIso,
              lastResult: result,
            })
            const skill = await db.skillProgress.get([session.profileId, skillId])
            const mastery = updateMastery(skill?.mastery ?? 0, {
              isCorrect: attempt.isCorrect,
              hintLevelUsed: attempt.hintLevelUsed,
              independent: attempt.hintLevelUsed === 0,
            }).next
            await db.skillProgress.put({
              profileId: session.profileId,
              skillId,
              mastery,
              attempts: (skill?.attempts ?? 0) + 1,
              correctAttempts: (skill?.correctAttempts ?? 0) + (attempt.isCorrect ? 1 : 0),
              hintedCorrectAttempts:
                (skill?.hintedCorrectAttempts ?? 0) +
                (attempt.isCorrect && attempt.hintLevelUsed > 0 ? 1 : 0),
              lastPracticedAt: nowIso,
            })
          }
          const topic = await db.topicProgress.get([session.profileId, attempt.topicId ?? 'unknown'])
          if (topic) {
            const next = updateMastery(topic.mastery, {
              isCorrect: attempt.isCorrect,
              hintLevelUsed: attempt.hintLevelUsed,
              independent: attempt.hintLevelUsed === 0,
            }).next
            await db.topicProgress.put({
              ...topic,
              mastery: next,
              status: next >= appConfig.masteryThresholds.masteredMin ? 'mastered' : 'inProgress',
              lastPracticedAt: nowIso,
            })
          }
        }

        const gamification = await db.gamification.get(session.profileId)
        const xp = (gamification?.xp ?? 0) + appConfig.xp.reviewCompleted
        if (gamification) {
          await db.gamification.put({
            ...gamification,
            xp,
            level: Math.floor(xp / 100) + 1,
            unlockedAchievementIds: [
              ...new Set([...gamification.unlockedAchievementIds, 'first-review-completed']),
            ],
          })
        }
        await db.sessions.update(sessionId, {
          status: 'completed',
          completedAt: nowIso,
          earnedXp: appConfig.xp.reviewCompleted,
        })
      },
    )
  }
}

export const reviewRepository = new ReviewRepository()
