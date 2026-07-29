import { diagnosticDefinitions, buildDiagnosticExercise } from '@/content/diagnostic/diagnosticExercises'
import { updateMastery } from '@/domain/mastery/updateMastery'
import { scheduleNextReview } from '@/domain/review/schedule'
import type { DiagnosticProgressState, ExerciseAttempt, ExerciseInstance, LearningSession, TopicProgress } from '@/types/domain'

import { db } from '../db/database'

export interface DiagnosticResult {
  strong: string[]
  review: string[]
  foundation: string[]
  confidence: Record<string, 'low' | 'medium' | 'high'>
  recommendedTopicId?: string
}

class DiagnosticRepository {
  async start(profileId: string): Promise<{ session: LearningSession; exercises: ExerciseInstance[] }> {
    const active = (
      await db.sessions.where('[profileId+status]').equals([profileId, 'active']).toArray()
    ).find((entry) => entry.type === 'diagnostic')
    if (active) return { session: active, exercises: this.restoreExercises(active) }
    const seeds = diagnosticDefinitions.map((entry) => `${entry.skillId}:0`)
    const session: LearningSession = {
      id: crypto.randomUUID(),
      profileId,
      type: 'diagnostic',
      status: 'active',
      startedAt: new Date().toISOString(),
      currentStage: 'diagnostic',
      currentExerciseIndex: 0,
      exerciseSeeds: seeds,
      progressState: {
        kind: 'diagnostic',
        exerciseIndex: 0,
        exerciseSeeds: seeds,
        selectedSkillIds: diagnosticDefinitions.map((entry) => entry.skillId),
      },
      earnedXp: 0,
    }
    await db.sessions.add(session)
    return { session, exercises: this.restoreExercises(session) }
  }

  restoreExercises(session: LearningSession): ExerciseInstance[] {
    const seeds = session.progressState?.kind === 'diagnostic'
      ? session.progressState.exerciseSeeds
      : session.exerciseSeeds
    return seeds
      .map((seed) => buildDiagnosticExercise(seed, session.id))
      .filter((entry): entry is ExerciseInstance => entry !== undefined)
  }

  async saveProgress(session: LearningSession, index: number, addFollowUpSkill?: string): Promise<void> {
    if (session.progressState?.kind !== 'diagnostic') return
    const state: DiagnosticProgressState = {
      kind: 'diagnostic',
      exerciseIndex: index,
      exerciseSeeds: [...session.progressState.exerciseSeeds],
      selectedSkillIds: [...session.progressState.selectedSkillIds],
    }
    const followUp = addFollowUpSkill ? `${addFollowUpSkill}:1` : undefined
    if (followUp && !state.exerciseSeeds.includes(followUp) && state.exerciseSeeds.length < 18) {
      state.exerciseSeeds.push(followUp)
    }
    session.currentExerciseIndex = index
    session.exerciseSeeds = state.exerciseSeeds
    session.progressState = state
    await db.sessions.update(session.id, {
      currentExerciseIndex: index,
      exerciseSeeds: state.exerciseSeeds,
      progressState: state,
    })
  }

  async complete(sessionId: string): Promise<DiagnosticResult> {
    let result: DiagnosticResult = { strong: [], review: [], foundation: [], confidence: {} }
    await db.transaction(
      'rw',
      [db.sessions, db.attempts, db.skillProgress, db.topicProgress, db.reviewItems, db.profiles],
      async () => {
        const session = await db.sessions.get(sessionId)
        if (!session) throw new Error('Діагностичну сесію не знайдено.')
        const attempts = await db.attempts.where('sessionId').equals(sessionId).toArray()
        if (session.status === 'completed') {
          result = classify(attempts)
          return
        }
        const now = new Date()
        const nowIso = now.toISOString()
        result = classify(attempts)
        const nonDiagnosticSessionIds = new Set(
          (await db.sessions.where('profileId').equals(session.profileId).toArray())
            .filter((entry) => entry.type !== 'diagnostic')
            .map((entry) => entry.id),
        )
        const previousAttempts = await db.attempts
          .where('profileId')
          .equals(session.profileId)
          .filter((attempt) => nonDiagnosticSessionIds.has(attempt.sessionId))
          .toArray()
        for (const definition of diagnosticDefinitions) {
          const skillAttempts = attempts.filter((attempt) => attempt.skillIds.includes(definition.skillId))
          const existing = await db.skillProgress.get([session.profileId, definition.skillId])
          let mastery = 0
          for (const attempt of skillAttempts) {
            mastery = updateMastery(mastery, {
              isCorrect: attempt.isCorrect,
              hintLevelUsed: attempt.hintLevelUsed,
              independent: attempt.hintLevelUsed === 0,
            }).next
          }
          if (skillAttempts.length && skillAttempts.every((attempt) => attempt.isCorrect)) mastery = Math.max(80, mastery)
          else if (skillAttempts.some((attempt) => attempt.isCorrect)) mastery = Math.max(45, mastery)
          const hasConfirmedMastery = previousAttempts.some((attempt) =>
            attempt.skillIds.includes(definition.skillId),
          )
          if (hasConfirmedMastery) mastery = Math.max(existing?.mastery ?? 0, mastery)
          await db.skillProgress.put({
            profileId: session.profileId,
            skillId: definition.skillId,
            mastery,
            attempts: (existing?.attempts ?? 0) + skillAttempts.length,
            correctAttempts:
              (existing?.correctAttempts ?? 0) +
              skillAttempts.filter((attempt) => attempt.isCorrect).length,
            hintedCorrectAttempts:
              (existing?.hintedCorrectAttempts ?? 0) +
              skillAttempts.filter((attempt) => attempt.isCorrect && attempt.hintLevelUsed > 0).length,
            lastPracticedAt: nowIso,
          })
          const topic: TopicProgress = {
            profileId: session.profileId,
            topicId: definition.topicId,
            mastery: Math.min(mastery, 79),
            status: mastery >= 60 ? 'ready' : mastery >= 25 ? 'reviewNeeded' : 'challenging',
            attempts: skillAttempts.length,
            independentCorrect: skillAttempts.filter((attempt) => attempt.isCorrect && attempt.hintLevelUsed === 0).length,
            lastPracticedAt: nowIso,
          }
          await db.topicProgress.put(topic)
          if (mastery >= 25 && mastery < 80) {
            const scheduled = scheduleNextReview(now, 0, 'incorrect')
            await db.reviewItems.put({
              id: `${session.profileId}:${definition.skillId}`,
              profileId: session.profileId,
              skillId: definition.skillId,
              intervalStep: scheduled.intervalStep,
              dueAt: scheduled.dueAt,
              lastResult: 'incorrect',
            })
          }
        }
        const recommended = diagnosticDefinitions.find((definition) =>
          result.foundation.includes(definition.skillId) || result.review.includes(definition.skillId),
        )
        result.recommendedTopicId = recommended?.topicId
        await db.sessions.update(sessionId, { status: 'completed', completedAt: nowIso })
        await db.profiles.update(session.profileId, { diagnosticCompletedAt: nowIso, updatedAt: nowIso })
      },
    )
    return result
  }

  async skip(profileId: string, sessionId?: string): Promise<void> {
    const now = new Date().toISOString()
    await db.transaction('rw', db.profiles, db.sessions, async () => {
      await db.profiles.update(profileId, { diagnosticSkippedAt: now, updatedAt: now })
      if (sessionId) await db.sessions.update(sessionId, { status: 'abandoned', completedAt: now })
    })
  }
}

function classify(attempts: ExerciseAttempt[]): DiagnosticResult {
  const result: DiagnosticResult = { strong: [], review: [], foundation: [], confidence: {} }
  for (const definition of diagnosticDefinitions) {
    const relevant = attempts.filter((attempt) => attempt.skillIds.includes(definition.skillId))
    const correct = relevant.filter((attempt) => attempt.isCorrect).length
    result.confidence[definition.skillId] =
      relevant.length >= 2 && (correct === 0 || correct === relevant.length)
        ? 'high'
        : relevant.length >= 1 && (correct === 0 || correct === relevant.length)
          ? 'medium'
          : 'low'
    if (relevant.length >= 1 && correct === relevant.length) result.strong.push(definition.skillId)
    else if (correct > 0) result.review.push(definition.skillId)
    else result.foundation.push(definition.skillId)
  }
  return result
}

export const diagnosticRepository = new DiagnosticRepository()
