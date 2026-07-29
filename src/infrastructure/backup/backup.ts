import { appConfig } from '@/content/config'
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
    activityPulses?: ActivityPulse[]
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
  'activityPulses',
] as const

const legacyRequiredTableNames = tableNames.filter((name) => name !== 'activityPulses')
export const MAX_BACKUP_BYTES = 25 * 1024 * 1024

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
  if (new TextEncoder().encode(raw).byteLength > MAX_BACKUP_BYTES) {
    throw new StorageError('invalidBackup', 'Backup перевищує максимальний розмір 25 МБ.')
  }
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
  if (
    typeof value.schemaVersion !== 'number' ||
    value.schemaVersion < 1 ||
    value.schemaVersion > appConfig.dataSchemaVersion ||
    typeof value.contentVersion !== 'number' ||
    typeof value.exportedAt !== 'string' ||
    Number.isNaN(Date.parse(value.exportedAt))
  ) {
    throw new StorageError('unsupportedBackup', 'Backup створено непідтримуваною версією даних.')
  }
  if (!isRecord(value.data)) throw new StorageError('invalidBackup', 'У backup відсутні дані.')
  for (const table of legacyRequiredTableNames) {
    if (!Array.isArray(value.data[table])) {
      throw new StorageError('invalidBackup', `У backup відсутня таблиця ${table}.`)
    }
    if (!(value.data[table] as unknown[]).every(isRecord)) {
      throw new StorageError('invalidBackup', `Таблиця ${table} містить некоректний запис.`)
    }
  }
  if (
    value.data.activityPulses !== undefined &&
    (!Array.isArray(value.data.activityPulses) || !value.data.activityPulses.every(isRecord))
  ) {
    throw new StorageError('invalidBackup', 'Таблиця activityPulses містить некоректний запис.')
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
  const primaryKey = (table: (typeof tableNames)[number], row: Record<string, unknown>): string => {
    switch (table) {
      case 'topicProgress':
        return `${String(row.profileId)}\u0000${String(row.topicId)}`
      case 'skillProgress':
        return `${String(row.profileId)}\u0000${String(row.skillId)}`
      case 'activityDays':
        return `${String(row.profileId)}\u0000${String(row.localDate)}`
      case 'activityPulses':
        return `${String(row.profileId)}\u0000${String(row.bucketStart)}`
      case 'gamification':
      case 'settings':
        return String(row.profileId)
      default:
        return String(row.id)
    }
  }
  for (const table of tableNames) {
    const rows = (value.data[table] ?? []) as Record<string, unknown>[]
    const keys = rows.map((row) => primaryKey(table, row))
    if (keys.some((key) => !key || key.includes('undefined')) || new Set(keys).size !== keys.length) {
      throw new StorageError('invalidBackup', `Таблиця ${table} містить дублікати або невалідні ключі.`)
    }
  }
  for (const table of tableNames.filter((name) => name !== 'profiles')) {
    for (const row of (value.data[table] ?? []) as Record<string, unknown>[]) {
      if (typeof row.profileId !== 'string' || !profileIds.has(row.profileId)) {
        throw new StorageError(
          'invalidBackup',
          `Таблиця ${table} посилається на невідомий профіль.`,
        )
      }
    }
  }
  const sessionIds = new Set(
    (value.data.sessions as Record<string, unknown>[]).map((row) => String(row.id)),
  )
  const attemptIds = new Set(
    (value.data.attempts as Record<string, unknown>[]).map((row) => String(row.id)),
  )
  for (const attempt of value.data.attempts as Record<string, unknown>[]) {
    if (!sessionIds.has(String(attempt.sessionId))) {
      throw new StorageError('invalidBackup', 'Спроба посилається на невідому навчальну сесію.')
    }
  }
  for (const mistake of value.data.mistakes as Record<string, unknown>[]) {
    if (
      !attemptIds.has(String(mistake.attemptId)) ||
      (mistake.resolvedAttemptId !== undefined &&
        !attemptIds.has(String(mistake.resolvedAttemptId)))
    ) {
      throw new StorageError('invalidBackup', 'Запис помилки посилається на невідому спробу.')
    }
  }
  return value as unknown as BackupEnvelopeV1
}

export async function replaceFromBackup(backup: BackupEnvelopeV1): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const name of [...tableNames].reverse()) await db.table(name).clear()
    for (const name of tableNames) {
      const rows = (backup.data[name] ?? []) as unknown[]
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
