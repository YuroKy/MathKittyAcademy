import Dexie, { type Table } from 'dexie'

import type {
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

  constructor() {
    super('math-kitty-academy')

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
  }
}

export const db = new MathKittyDatabase()
