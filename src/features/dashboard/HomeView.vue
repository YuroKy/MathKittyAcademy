<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { curriculumTopics } from '@/content/curriculum/topics'
import { recommendNextTopic } from '@/domain/learning/prerequisites'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { GamificationState, TopicProgress } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()
const topicProgress = ref<TopicProgress[]>([])
const gamification = ref<GamificationState>()
const dueReviews = ref(0)
const loading = ref(true)

const nextTopic = computed(() => recommendNextTopic(curriculumTopics, topicProgress.value))
const nextProgress = computed(
  () => topicProgress.value.find((entry) => entry.topicId === nextTopic.value?.id)?.mastery ?? 0,
)
const levelProgress = computed(() => (gamification.value?.xp ?? 0) % 100)

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (!profileId) return

  try {
    ;[topicProgress.value, gamification.value, dueReviews.value] = await Promise.all([
      learningRepository.listTopicProgress(profileId),
      learningRepository.getGamification(profileId),
      learningRepository.countDueReviews(profileId),
    ])
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="dashboard page-shell">
    <header class="dashboard-greeting">
      <div>
        <span class="eyebrow">Твій наступний крок</span>
        <h1>Привіт, {{ profileStore.activeProfile?.name }}!</h1>
        <p>Сьогодні достатньо одного короткого заняття.</p>
      </div>
      <MascotCard
        mood="encouraging"
        message="Я вже приготувала олівець. Рушаймо у твоєму темпі."
        compact
      />
    </header>

    <div v-if="loading" class="loading-state" role="status">Шукаємо найкращий наступний крок…</div>

    <template v-else>
      <article v-if="nextTopic" class="next-card">
        <div class="next-card__topline">
          <span class="subject-pill">Основи математики</span>
          <span>{{ nextTopic.estimatedMinutes }} хв</span>
        </div>
        <div class="next-card__body">
          <div>
            <span class="next-card__number">{{ String(nextTopic.order).padStart(2, '0') }}</span>
            <h2>{{ nextTopic.title }}</h2>
            <p>{{ nextTopic.shortDescription }}</p>
          </div>
          <div class="next-card__reason">
            <span aria-hidden="true">✦</span>
            <p>
              {{
                nextProgress > 0
                  ? 'Продовжимо з місця, де зупинилися.'
                  : 'Ця тема створить опору для дробів, відсотків і рівнянь.'
              }}
            </p>
          </div>
        </div>
        <ProgressBar
          v-if="nextProgress > 0"
          :value="nextProgress"
          label="Засвоєння теми"
          :show-value="true"
        />
        <BaseButton @click="router.push(`/learn/${nextTopic.id}`)">
          {{ nextProgress > 0 ? 'Продовжити навчання' : 'Почати заняття' }}
          <span aria-hidden="true">→</span>
        </BaseButton>
      </article>

      <div class="dashboard-stats">
        <article class="stat-card">
          <div class="stat-card__icon stat-card__icon--pink" aria-hidden="true">♥</div>
          <div>
            <span>Щоденна ціль</span>
            <strong>0 / {{ profileStore.activeProfile?.dailyGoalMinutes }} хв</strong>
          </div>
          <ProgressBar
            :value="0"
            :max="profileStore.activeProfile?.dailyGoalMinutes ?? 10"
            label="Щоденна ціль"
          />
        </article>
        <article class="stat-card">
          <div class="stat-card__icon stat-card__icon--blue" aria-hidden="true">✦</div>
          <div>
            <span>Рівень {{ gamification?.level ?? 1 }}</span>
            <strong>{{ gamification?.xp ?? 0 }} XP</strong>
          </div>
          <ProgressBar :value="levelProgress" label="Прогрес поточного рівня" />
        </article>
        <article class="stat-card">
          <div class="stat-card__icon stat-card__icon--gold" aria-hidden="true">↻</div>
          <div>
            <span>Повторення</span>
            <strong>{{ dueReviews }} на сьогодні</strong>
          </div>
          <button class="text-button" type="button" @click="router.push('/review')">
            Відкрити чергу
          </button>
        </article>
      </div>

      <div class="dashboard-links">
        <button type="button" @click="router.push('/map')">
          <span aria-hidden="true">✦</span>
          <span>
            <strong>Карта академії</strong>
            <small>Побачити всі 15 тем і залежності</small>
          </span>
          <span aria-hidden="true">→</span>
        </button>
        <button type="button" @click="router.push('/mistakes')">
          <span aria-hidden="true">⌁</span>
          <span>
            <strong>Заплутані клубочки</strong>
            <small>Повернутися до складних місць</small>
          </span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </template>
  </section>
</template>
