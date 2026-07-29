<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import AppIcon from '@/components/base/AppIcon.vue'
import OfflineIndicator from '@/components/base/OfflineIndicator.vue'
import PwaPrompt from '@/components/base/PwaPrompt.vue'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { settingsRepository } from '@/infrastructure/repositories/settingsRepository'
import { useProfileStore } from '@/stores/profile'
import type { GamificationState } from '@/types/domain'

const route = useRoute()
const profileStore = useProfileStore()
const gamification = ref<GamificationState>()

const showNavigation = computed(
  () =>
    Boolean(profileStore.activeProfile) &&
    !['lesson', 'review', 'diagnostic', 'onboarding', 'welcome', 'profiles', 'entry'].includes(String(route.name)),
)

onMounted(() => profileStore.initialize())

watch(
  [() => profileStore.activeProfile?.id, () => route.fullPath],
  async ([profileId]) => {
    gamification.value = profileId ? await learningRepository.getGamification(profileId) : undefined
    const settings = profileId ? await settingsRepository.get(profileId) : undefined
    document.documentElement.classList.toggle(
      'user-reduced-motion',
      settings?.reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )
    document.documentElement.classList.toggle('user-high-contrast', settings?.highContrast ?? false)
  },
  { immediate: true },
)
</script>

<template>
  <div class="app-root">
    <OfflineIndicator />

    <header v-if="showNavigation" class="app-header">
      <div class="app-header__inner">
        <RouterLink class="brand" to="/home" aria-label="На головну">
          <span class="brand__crest">
            <img src="/murka-anime-avatar-v2.png" alt="" width="44" height="44" />
          </span>
          <span class="brand__copy">
            <strong>Math Kitty</strong>
            <small>Academy</small>
          </span>
        </RouterLink>

        <nav class="desktop-nav" aria-label="Головна навігація">
          <RouterLink to="/home">
            <AppIcon name="home" />
            <span>Головна</span>
          </RouterLink>
          <RouterLink to="/map" aria-label="Карта навчання">
            <AppIcon name="map" />
            <span>Карта</span>
          </RouterLink>
          <RouterLink to="/progress">
            <AppIcon name="progress" />
            <span>Прогрес</span>
          </RouterLink>
          <RouterLink to="/collection">
            <AppIcon name="collection" />
            <span>Колекція</span>
          </RouterLink>
          <RouterLink to="/settings">
            <AppIcon name="settings" />
            <span>Налаштування</span>
          </RouterLink>
        </nav>

        <div class="header-resources" aria-label="Навчальні ресурси">
          <span class="resource-pill resource-pill--streak">
            <AppIcon name="flame" />
            <strong>{{ gamification?.currentStreak ?? 0 }}</strong>
            <small>серія</small>
          </span>
          <span class="resource-pill resource-pill--xp">
            <AppIcon name="star" />
            <strong>{{ gamification?.xp ?? 0 }}</strong>
            <small>XP</small>
          </span>
          <span class="resource-pill resource-pill--level">
            <AppIcon name="crown" />
            <strong>{{ gamification?.level ?? 1 }}</strong>
            <small>рівень</small>
          </span>
          <RouterLink class="header-profile" to="/profiles" aria-label="Змінити активний профіль">
            <img src="/murka-anime-avatar-v2.png" alt="" width="34" height="34" />
            <span>{{ profileStore.activeProfile?.name }}</span>
          </RouterLink>
        </div>
      </div>
    </header>

    <main :class="['app-main', { 'app-main--with-nav': showNavigation }]">
      <div v-if="!profileStore.initialized" class="loading-state" role="status">
        Відкриваємо академію…
      </div>
      <div v-else-if="profileStore.errorMessage" class="error-state" role="alert">
        <strong>Локальне сховище недоступне</strong>
        <span>{{ profileStore.errorMessage }}</span>
      </div>
      <RouterView v-else />
    </main>

    <nav v-if="showNavigation" class="bottom-nav" aria-label="Головна навігація">
      <RouterLink to="/home">
        <AppIcon name="home" />
        <small>Головна</small>
      </RouterLink>
      <RouterLink to="/map" aria-label="Карта навчання">
        <AppIcon name="map" />
        <small>Карта</small>
      </RouterLink>
      <RouterLink to="/progress">
        <AppIcon name="progress" />
        <small>Прогрес</small>
      </RouterLink>
      <RouterLink to="/collection">
        <AppIcon name="collection" />
        <small>Колекція</small>
      </RouterLink>
      <RouterLink to="/settings">
        <AppIcon name="settings" />
        <small>Налаштування</small>
      </RouterLink>
    </nav>

    <PwaPrompt />
  </div>
</template>
