import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'

import { MathKittyDatabase } from './database'

const names: string[] = []

afterEach(async () => {
  await Promise.all(names.splice(0).map((name) => Dexie.delete(name)))
})

describe('database migrations', () => {
  it('migrates v2 attempts and creates the activity table without losing data', async () => {
    const name = `math-kitty-migration-${crypto.randomUUID()}`
    names.push(name)
    const legacy = new Dexie(name)
    legacy.version(2).stores({
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
    await legacy.open()
    await legacy.table('attempts').add({
      id: 'old-attempt',
      profileId: 'profile',
      sessionId: 'session',
      exerciseId: 'exercise',
      templateId: 'template',
      seed: 'seed',
      skillIds: ['skill'],
      submittedAnswer: '1',
      normalizedAnswer: '1',
      isCorrect: true,
      hintLevelUsed: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    legacy.close()

    const migrated = new MathKittyDatabase(name)
    await migrated.open()
    expect((await migrated.attempts.get('old-attempt'))?.topicId).toBe('unknown')
    expect(migrated.tables.some((table) => table.name === 'activityDays')).toBe(true)
    migrated.close()
  })
})
