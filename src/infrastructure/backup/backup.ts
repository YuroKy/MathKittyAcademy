import { appConfig } from '@/content/config'
import type {
  ActivityDay,
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

import { db } from '../db/database'
import { StorageError } from '../errors/storageError'

export const BACKUP_FORMAT_VERSION = 1

export interface BackupEnvelopeV1 {
  format: 'math-kitty-academy-backup'
  formatVersion: 1
  appVersion: string
  schemaVersion: number
  contentVersion: number
  exportedAt: string
  data: {
    profiles: StudentProfile[]
    topicProgress: TopicProgress[]
    skillProgress: SkillProgress[]
    sessions: LearningSession[]
    attempts: ExerciseAttempt[]
    reviewItems: ReviewItem[]
    mistakes: MistakeRecord[]
    gamification: GamificationState[]
    settings: AppSettings[]
    activityDays: ActivityDay[]
  }
}

const tableNames = [
  'profiles',
  'topicProgress',
  'skillProgress',
  'sessions',
  'attempts',
  'reviewItems',
  'mistakes',
  'gamification',
  'settings',
  'activityDays',
] as const

export async function createBackup(): Promise<BackupEnvelopeV1> {
  const values = await Promise.all(tableNames.map((name) => db.table(name).toArray()))
  const data = Object.fromEntries(tableNames.map((name, index) => [name, values[index]]))
  return {
    format: 'math-kitty-academy-backup',
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: appConfig.version,
    schemaVersion: appConfig.dataSchemaVersion,
    contentVersion: appConfig.contentVersion,
    exportedAt: new Date().toISOString(),
    data,
  } as BackupEnvelopeV1
}

export function parseBackup(raw: string): BackupEnvelopeV1 {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch (error) {
    throw new StorageError('invalidBackup', 'Backup містить некоректний JSON.', { cause: error })
  }
  if (!isRecord(value) || value.format !== 'math-kitty-academy-backup') {
    throw new StorageError('invalidBackup', 'Невідомий формат backup.')
  }
  if (value.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new StorageError('unsupportedBackup', 'Непідтримувана версія backup.')
  }
  if (!isRecord(value.data)) throw new StorageError('invalidBackup', 'У backup відсутні дані.')
  for (const table of tableNames) {
    if (!Array.isArray(value.data[table])) {
      throw new StorageError('invalidBackup', `У backup відсутня таблиця ${table}.`)
    }
    if (!(value.data[table] as unknown[]).every(isRecord)) {
      throw new StorageError('invalidBackup', `Таблиця ${table} містить некоректний запис.`)
    }
  }
  const profiles = value.data.profiles as unknown[]
  if (
    !profiles.every(
      (profile) =>
        isRecord(profile) &&
        typeof profile.id === 'string' &&
        typeof profile.name === 'string' &&
        typeof profile.dailyGoalMinutes === 'number',
    )
  ) {
    throw new StorageError('invalidBackup', 'Backup містить некоректні профілі.')
  }
  const profileIds = new Set(
    profiles.map((profile) => (profile as Record<string, unknown>).id as string),
  )
  if (profileIds.size !== profiles.length) {
    throw new StorageError('invalidBackup', 'Backup містить дублікати профілів.')
  }
  for (const table of tableNames.filter((name) => name !== 'profiles')) {
    for (const row of value.data[table] as Record<string, unknown>[]) {
      if (typeof row.profileId !== 'string' || !profileIds.has(row.profileId)) {
        throw new StorageError(
          'invalidBackup',
          `Таблиця ${table} посилається на невідомий профіль.`,
        )
      }
    }
  }
  return value as unknown as BackupEnvelopeV1
}

export async function replaceFromBackup(backup: BackupEnvelopeV1): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const name of [...tableNames].reverse()) await db.table(name).clear()
    for (const name of tableNames) {
      const rows = backup.data[name] as unknown[]
      if (rows.length) await db.table(name).bulkAdd(rows)
    }
  })
}

export function backupFilename(at = new Date()): string {
  return `math-kitty-backup-${at.toISOString().slice(0, 10)}.json`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
