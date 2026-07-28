<script setup lang="ts">
import { useRouter } from 'vue-router'

import AppIcon from '@/components/base/AppIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { useProfileStore } from '@/stores/profile'
import type { StudentProfile } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()

async function selectProfile(profile: StudentProfile): Promise<void> {
  profileStore.selectProfile(profile)
  await router.push('/home')
}
</script>

<template>
  <section class="centered-page page-shell">
    <div class="page-heading">
      <span class="eyebrow">Локальні профілі</span>
      <h1>Хто сьогодні навчається?</h1>
      <p>Усі дані залишаються у цьому браузері.</p>
    </div>

    <div class="profile-layout">
      <MascotCard mood="neutral" compact />
      <div class="profile-list">
        <button
          v-for="profile in profileStore.profiles"
          :key="profile.id"
          class="profile-option"
          type="button"
          @click="selectProfile(profile)"
        >
          <span class="profile-option__avatar" aria-hidden="true"><AppIcon name="paw" /></span>
          <span>
            <strong>{{ profile.name }}</strong>
            <small>{{ profile.dailyGoalMinutes }} хв щодня</small>
          </span>
          <AppIcon name="arrow-right" />
        </button>

        <BaseButton variant="secondary" @click="router.push('/onboarding')">
          + Створити інший профіль
        </BaseButton>
      </div>
    </div>
  </section>
</template>
