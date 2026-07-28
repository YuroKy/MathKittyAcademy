<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import OfflineIndicator from '@/components/base/OfflineIndicator.vue'
import PwaPrompt from '@/components/base/PwaPrompt.vue'
import { useProfileStore } from '@/stores/profile'

const route = useRoute()
const profileStore = useProfileStore()

const showNavigation = computed(
  () =>
    Boolean(profileStore.activeProfile) &&
    !['lesson', 'onboarding', 'welcome', 'profiles', 'entry'].includes(String(route.name)),
)

onMounted(() => profileStore.initialize())
</script>

<template>
  <div class="app-root">
    <OfflineIndicator />

    <header v-if="showNavigation" class="app-header">
      <RouterLink class="brand" to="/home" aria-label="На головну">
        <img src="/mascot-icon.svg" alt="" width="42" height="42" />
        <span>Math Kitty</span>
      </RouterLink>
      <div class="header-profile" aria-label="Активний профіль">
        <span class="header-profile__dot" aria-hidden="true">♥</span>
        {{ profileStore.activeProfile?.name }}
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
      <RouterLink to="/home" aria-label="Головна">
        <span aria-hidden="true">⌂</span>
        <small>Головна</small>
      </RouterLink>
      <RouterLink to="/map" aria-label="Карта навчання">
        <span aria-hidden="true">✦</span>
        <small>Карта</small>
      </RouterLink>
      <RouterLink to="/progress" aria-label="Прогрес">
        <span aria-hidden="true">♡</span>
        <small>Прогрес</small>
      </RouterLink>
      <RouterLink to="/collection" aria-label="Колекція">
        <span aria-hidden="true">★</span>
        <small>Колекція</small>
      </RouterLink>
    </nav>

    <PwaPrompt />
  </div>
</template>
