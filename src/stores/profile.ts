import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  profileRepository,
  type CreateProfileInput,
} from '@/infrastructure/repositories/profileRepository'
import type { StudentProfile } from '@/types/domain'

const ACTIVE_PROFILE_KEY = 'math-kitty-active-profile'

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<StudentProfile[]>([])
  const activeProfile = ref<StudentProfile>()
  const initialized = ref(false)
  const errorMessage = ref('')

  const hasProfiles = computed(() => profiles.value.length > 0)

  async function initialize(): Promise<void> {
    if (initialized.value) return

    try {
      profiles.value = await profileRepository.list()
      const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY)
      activeProfile.value = activeId
        ? profiles.value.find((profile) => profile.id === activeId)
        : undefined
    } catch (error) {
      console.error('Failed to initialize local profiles', error)
      errorMessage.value =
        'Не вдалося відкрити локальне сховище. Перевір, чи браузер дозволяє зберігати дані.'
    } finally {
      initialized.value = true
    }
  }

  async function createProfile(input: CreateProfileInput): Promise<StudentProfile> {
    const profile = await profileRepository.create(input)
    profiles.value.unshift(profile)
    selectProfile(profile)
    return profile
  }

  async function refresh(): Promise<void> {
    profiles.value = await profileRepository.list()
    if (activeProfile.value) {
      activeProfile.value = profiles.value.find((profile) => profile.id === activeProfile.value?.id)
    }
  }

  async function updateActiveProfile(
    changes: Parameters<typeof profileRepository.update>[1],
  ): Promise<void> {
    if (!activeProfile.value) return
    activeProfile.value = await profileRepository.update(activeProfile.value.id, changes)
    await refresh()
  }

  async function resetActiveProgress(): Promise<void> {
    if (activeProfile.value) await profileRepository.resetProgress(activeProfile.value.id)
  }

  async function deleteActiveProfile(): Promise<void> {
    if (!activeProfile.value) return
    await profileRepository.delete(activeProfile.value.id)
    clearActiveProfile()
    await refresh()
  }

  function selectProfile(profile: StudentProfile): void {
    activeProfile.value = profile
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id)
  }

  function clearActiveProfile(): void {
    activeProfile.value = undefined
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
  }

  return {
    profiles,
    activeProfile,
    initialized,
    errorMessage,
    hasProfiles,
    initialize,
    createProfile,
    refresh,
    updateActiveProfile,
    resetActiveProgress,
    deleteActiveProfile,
    selectProfile,
    clearActiveProfile,
  }
})
