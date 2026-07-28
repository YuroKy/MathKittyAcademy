<script setup lang="ts">
import { RouterLink } from 'vue-router'

import AppIcon from '@/components/base/AppIcon.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { appConfig } from '@/content/config'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
</script>

<template>
  <section class="welcome-page page-shell">
    <div class="welcome-copy">
      <span class="eyebrow">Твоя затишна математична академія</span>
      <h1>{{ appConfig.productName }}</h1>
      <p class="welcome-lead">
        Відновимо математику з основ і крок за кроком підготуємося до НМТ — без сорому,
        поспіху й перевантаження.
      </p>

      <div class="welcome-actions">
        <RouterLink class="base-button base-button--primary" to="/onboarding">
          Створити профіль
          <span aria-hidden="true">→</span>
        </RouterLink>
        <RouterLink
          v-if="profileStore.hasProfiles"
          class="base-button base-button--secondary"
          to="/profiles"
        >
          Обрати наявний профіль
        </RouterLink>
      </div>

      <p class="privacy-note">
        <AppIcon name="home" />
        Прогрес зберігається лише на цьому пристрої. Обліковий запис не потрібен.
      </p>
    </div>

    <div class="welcome-visual">
      <span class="sticker sticker--star" aria-hidden="true"><AppIcon name="star" /></span>
      <MascotCard
        mood="encouraging"
        message="Привіт! Я Мурка. Почнемо з того місця, де тобі комфортно."
      />
      <span class="sticker sticker--heart" aria-hidden="true"><AppIcon name="heart" /></span>
    </div>

    <div class="welcome-features" aria-label="Переваги">
      <article>
        <span class="feature-icon" aria-hidden="true"><AppIcon name="clock" /></span>
        <div>
          <h2>Короткі заняття</h2>
          <p>Достатньо 10–15 хвилин за раз.</p>
        </div>
      </article>
      <article>
        <span class="feature-icon" aria-hidden="true"><AppIcon name="sparkles" /></span>
        <div>
          <h2>Зрозумілі кроки</h2>
          <p>Спочатку приклад, потім твоя спроба.</p>
        </div>
      </article>
      <article>
        <span class="feature-icon" aria-hidden="true"><AppIcon name="heart" /></span>
        <div>
          <h2>Лагідно до помилок</h2>
          <p>Кожна помилка підказує, що повторити.</p>
        </div>
      </article>
    </div>
  </section>
</template>
