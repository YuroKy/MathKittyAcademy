import Dexie, { type Table } from 'dexie'

import type {
  ActivityDay,
  ActivityPulse,
  AppSettings,
  ExerciseAttempt,
  GamificationState,
  LearningSession,
  MistakeRecord,
  ReviewItem,
  SkillProgress,
  StudentProfile,
  TopicProgress,
} from '@/types/domain'

export class MathKittyDatabase extends Dexie {
  profiles!: Table<StudentProfile, string>
  topicProgress!: Table<TopicProgress, [string, string]>
  skillProgress!: Table<SkillProgress, [string, string]>
  sessions!: Table<LearningSession, string>
  attempts!: Table<ExerciseAttempt, string>
  reviewItems!: Table<ReviewItem, string>
  mistakes!: Table<MistakeRecord, string>
  gamification!: Table<GamificationState, string>
  settings!: Table<AppSettings, string>
  activityDays!: Table<ActivityDay, [string, string]>
  activityPulses!: Table<ActivityPulse, [string, string]>

  constructor(name = 'math-kitty-academy') {
    super(name)

    this.version(1).stores({
      profiles: 'id, updatedAt',
      topicProgress: '[profileId+topicId], profileId, topicId, status, lastPracticedAt',
      skillProgress: '[profileId+skillId], profileId, skillId, lastPracticedAt',
      sessions: 'id, profileId, [profileId+status], [profileId+topicId], startedAt',
      attempts: 'id, profileId, sessionId, exerciseId, createdAt',
      reviewItems: 'id, profileId, [profileId+skillId], [profileId+dueAt]',
      mistakes: 'id, profileId, topicId, [profileId+resolved], createdAt',
      gamification: 'profileId',
      settings: 'profileId',
    })

    this.version(2)
      .stores({
        profiles: 'id, updatedAt',
        topicProgress: '[profileId+topicId], profileId, topicId, status, lastPracticedAt',
        skillProgress: '[profileId+skillId], profileId, skillId, lastPracticedAt',
        sessions: 'id, profileId, [profileId+status], [profileId+topicId], startedAt',
        attempts: 'id, profileId, sessionId, exerciseId, createdAt',
        reviewItems: 'id, profileId, [profileId+skillId], [profileId+dueAt]',
        mistakes: 'id, profileId, topicId, [profileId+resolved], createdAt',
        gamification: 'profileId',
        settings: 'profileId',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table('topicProgress')
          .toCollection()
          .modify((entry: { status?: string }) => {
            if (entry.status === 'locked' || entry.status === 'available') {
              entry.status = 'ready'
            }
          })
      })

    this.version(3)
      .stores({
        profiles: 'id, updatedAt',
        topicProgress: '[profileId+topicId], profileId, topicId, status, lastPracticedAt',
        skillProgress: '[profileId+skillId], profileId, skillId, lastPracticedAt',
        sessions: 'id, profileId, [profileId+status], [profileId+topicId], startedAt',
        attempts: 'id, profileId, sessionId, topicId, exerciseId, createdAt',
        reviewItems: 'id, profileId, [profileId+skillId], [profileId+dueAt]',
        mistakes: 'id, profileId, topicId, errorType, [profileId+resolved], createdAt',
        gamification: 'profileId',
        settings: 'profileId',
        activityDays: '[profileId+localDate], profileId, localDate',
      })
      .upgrade(async (transaction) => {
        await transaction
          .table('attempts')
          .toCollection()
          .modify((attempt: ExerciseAttempt) => {
            attempt.topicId ??= 'unknown'
          })
      })

    this.version(4).stores({
      profiles: 'id, updatedAt',
      topicProgress: '[profileId+topicId], profileId, topicId, status, lastPracticedAt',
      skillProgress: '[profileId+skillId], profileId, skillId, lastPracticedAt',
      sessions: 'id, profileId, [profileId+status], [profileId+topicId], startedAt',
      attempts: 'id, profileId, sessionId, topicId, exerciseId, createdAt',
      reviewItems: 'id, profileId, [profileId+skillId], [profileId+dueAt]',
      mistakes: 'id, profileId, topicId, errorType, [profileId+resolved], createdAt',
      gamification: 'profileId',
      settings: 'profileId',
      activityDays: '[profileId+localDate], profileId, localDate',
      activityPulses: '[profileId+bucketStart], profileId, bucketStart',
    })
  }
}

export const db = new MathKittyDatabase()
