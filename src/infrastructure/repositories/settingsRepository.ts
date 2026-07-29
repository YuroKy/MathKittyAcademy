import type { AppSettings } from '@/types/domain'

import { db } from '../db/database'

class SettingsRepository {
  async get(profileId: string): Promise<AppSettings | undefined> {
    return db.settings.get(profileId)
  }

  async update(
    profileId: string,
    changes: Partial<Pick<AppSettings, 'soundEnabled' | 'reducedMotion' | 'highContrast'>>,
  ): Promise<AppSettings> {
    const current = await db.settings.get(profileId)
    const next: AppSettings = {
      profileId,
      soundEnabled: current?.soundEnabled ?? true,
      reducedMotion: current?.reducedMotion ?? false,
      highContrast: current?.highContrast ?? false,
      ...changes,
      updatedAt: new Date().toISOString(),
    }
    await db.settings.put(next)
    return next
  }
}

export const settingsRepository = new SettingsRepository()
