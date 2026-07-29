import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '@/infrastructure/db/database'
import { StorageError } from '@/infrastructure/errors/storageError'

import { createBackup, parseBackup, replaceFromBackup } from './backup'

beforeEach(async () => {
  await db.open()
  await db.transaction('rw', db.tables, () => Promise.all(db.tables.map((table) => table.clear())))
})

describe('backup', () => {
  it('round-trips all local tables through a versioned envelope', async () => {
    await db.profiles.add({
      id: 'profile-1',
      name: 'Марта',
      avatarId: 'cat',
      dailyGoalMinutes: 10,
      preferredStudyDays: [1, 3, 5],
      createdAt: '2026-07-29T10:00:00.000Z',
      updatedAt: '2026-07-29T10:00:00.000Z',
    })
    const backup = await createBackup()
    await db.profiles.clear()
    await replaceFromBackup(parseBackup(JSON.stringify(backup)))
    expect((await db.profiles.get('profile-1'))?.name).toBe('Марта')
  })

  it('rejects invalid data before modifying the database', async () => {
    await db.profiles.add({
      id: 'keep',
      name: 'Леся',
      avatarId: 'cat',
      dailyGoalMinutes: 10,
      preferredStudyDays: [],
      createdAt: '2026-07-29T10:00:00.000Z',
      updatedAt: '2026-07-29T10:00:00.000Z',
    })
    expect(() => parseBackup('{"format":"other"}')).toThrow(StorageError)
    expect(await db.profiles.get('keep')).toBeDefined()
  })
})
