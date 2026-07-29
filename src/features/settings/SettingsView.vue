<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { appConfig } from '@/content/config'
import {
  backupFilename,
  createBackup,
  parseBackup,
  replaceFromBackup,
  type BackupEnvelopeV1,
} from '@/infrastructure/backup/backup'
import { storageErrorMessages, toStorageError } from '@/infrastructure/errors/storageError'
import { settingsRepository } from '@/infrastructure/repositories/settingsRepository'
import { useProfileStore } from '@/stores/profile'
import type { AppSettings, DailyGoalMinutes } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()
const name = ref('')
const dailyGoalMinutes = ref<DailyGoalMinutes>(10)
const settings = ref<AppSettings>()
const importFile = ref<File>()
const importPreview = ref<BackupEnvelopeV1>()
const importRaw = ref('')
const message = ref('')
const errorMessage = ref('')
const saving = ref(false)
const preferredStudyDays = ref<number[]>([])

onMounted(async () => {
  const profile = profileStore.activeProfile
  if (!profile) return
  name.value = profile.name
  dailyGoalMinutes.value = profile.dailyGoalMinutes
  preferredStudyDays.value = [...profile.preferredStudyDays]
  settings.value = await settingsRepository.get(profile.id)
})

async function savePreferences(): Promise<void> {
  const profileId = profileStore.activeProfile?.id
  if (!profileId || !settings.value || saving.value) return
  saving.value = true
  clearMessages()
  try {
    await profileStore.updateActiveProfile({
      name: name.value,
      dailyGoalMinutes: dailyGoalMinutes.value,
      preferredStudyDays: preferredStudyDays.value,
    })
    settings.value = await settingsRepository.update(profileId, {
      soundEnabled: settings.value.soundEnabled,
      reducedMotion: settings.value.reducedMotion,
      highContrast: settings.value.highContrast,
    })
    applySettings(settings.value)
    message.value = 'Налаштування збережено.'
  } catch (error) {
    errorMessage.value = storageErrorMessages[toStorageError(error).code]
  } finally {
    saving.value = false
  }
}

async function exportBackup(): Promise<void> {
  clearMessages()
  try {
    downloadBackup(await createBackup())
    message.value = 'Резервну копію підготовлено.'
  } catch (error) {
    errorMessage.value = storageErrorMessages[toStorageError(error).code]
  }
}

async function selectImportFile(event: Event): Promise<void> {
  clearMessages()
  importPreview.value = undefined
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  importFile.value = file
  try {
    importRaw.value = await file.text()
    importPreview.value = parseBackup(importRaw.value)
  } catch (error) {
    errorMessage.value = storageErrorMessages[toStorageError(error, 'invalidBackup').code]
  }
}

async function confirmImport(): Promise<void> {
  if (!importPreview.value || saving.value) return
  saving.value = true
  clearMessages()
  try {
    downloadBackup(await createBackup(), 'pre-import-')
    await replaceFromBackup(importPreview.value)
    localStorage.removeItem('math-kitty-active-profile')
    window.location.assign(import.meta.env.BASE_URL)
  } catch (error) {
    errorMessage.value = storageErrorMessages[toStorageError(error).code]
    saving.value = false
  }
}

async function resetProgress(): Promise<void> {
  const profile = profileStore.activeProfile
  if (!profile || !window.confirm(`Скинути весь навчальний прогрес профілю «${profile.name}»?`)) return
  await profileStore.resetActiveProgress()
  message.value = 'Навчальний прогрес скинуто.'
}

async function deleteProfile(): Promise<void> {
  const profile = profileStore.activeProfile
  if (!profile || !window.confirm(`Назавжди видалити профіль «${profile.name}» і всі його дані?`)) return
  await profileStore.deleteActiveProfile()
  await router.replace(profileStore.hasProfiles ? '/profiles' : '/welcome')
}

function downloadBackup(backup: BackupEnvelopeV1, prefix = ''): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${prefix}${backupFilename()}`
  anchor.click()
  URL.revokeObjectURL(url)
}

function applySettings(value: AppSettings): void {
  document.documentElement.classList.toggle('user-reduced-motion', value.reducedMotion)
  document.documentElement.classList.toggle('user-high-contrast', value.highContrast)
}

function clearMessages(): void {
  message.value = ''
  errorMessage.value = ''
}
</script>

<template>
  <section class="settings-page page-shell">
    <header class="page-heading">
      <span class="eyebrow">Дані під твоїм контролем</span>
      <h1>Налаштування</h1>
      <p>Зміни профіль, доступність або збережи локальну резервну копію.</p>
    </header>

    <div class="settings-grid">
      <section class="settings-card">
        <h2>Профіль</h2>
        <label class="field">
          <span>Ім’я</span>
          <input v-model="name" maxlength="30" />
        </label>
        <fieldset class="study-days">
          <legend>Навчальні дні</legend>
          <label v-for="(day, index) in ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']" :key="day">
            <input v-model="preferredStudyDays" type="checkbox" :value="index" />
            <span>{{ day }}</span>
          </label>
        </fieldset>
        <label class="field">
          <span>Щоденна ціль</span>
          <select v-model="dailyGoalMinutes">
            <option :value="10">10 хвилин</option>
            <option :value="15">15 хвилин</option>
            <option :value="20">20 хвилин</option>
          </select>
        </label>
        <label v-if="settings" class="settings-toggle">
          <input v-model="settings.soundEnabled" type="checkbox" />
          <span>Звуки</span>
        </label>
        <label v-if="settings" class="settings-toggle">
          <input v-model="settings.reducedMotion" type="checkbox" />
          <span>Менше анімацій</span>
        </label>
        <label v-if="settings" class="settings-toggle">
          <input v-model="settings.highContrast" type="checkbox" />
          <span>Високий контраст</span>
        </label>
        <BaseButton :disabled="saving || !name.trim()" @click="savePreferences">
          Зберегти налаштування
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/diagnostic')">
          Пройти діагностику знову
        </BaseButton>
      </section>

      <section class="settings-card">
        <h2>Резервна копія</h2>
        <p>Backup містить усі локальні профілі, уроки, спроби, нагороди та налаштування.</p>
        <BaseButton variant="secondary" @click="exportBackup">Експортувати JSON</BaseButton>
        <label class="field">
          <span>Вибрати backup для відновлення</span>
          <input type="file" accept="application/json,.json" @change="selectImportFile" />
        </label>
        <div v-if="importPreview" class="backup-preview">
          <strong>{{ importPreview.data.profiles.length }} профілів</strong>
          <span>Експорт: {{ new Date(importPreview.exportedAt).toLocaleString('uk-UA') }}</span>
          <p>Імпорт повністю замінить локальні дані. Поточна копія завантажиться автоматично.</p>
          <BaseButton :disabled="saving" @click="confirmImport">Замінити й відновити</BaseButton>
        </div>
      </section>

      <section class="settings-card settings-card--danger">
        <h2>Керування даними</h2>
        <BaseButton variant="secondary" @click="resetProgress">Скинути прогрес профілю</BaseButton>
        <BaseButton variant="secondary" @click="deleteProfile">Видалити профіль</BaseButton>
        <small>Версія {{ appConfig.version }} · схема даних {{ appConfig.dataSchemaVersion }}</small>
      </section>
    </div>

    <p v-if="message" class="success-message" role="status">{{ message }}</p>
    <p v-if="errorMessage" class="inline-error" role="alert">{{ errorMessage }}</p>
  </section>
</template>
