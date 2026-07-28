<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AppIcon from '@/components/base/AppIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import {
  learningRepository,
  type LearningStats,
} from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { GamificationState, TopicProgress } from '@/types/domain'

type CollectionCategory = 'all' | 'stickers' | 'badges' | 'accessories' | 'rare'
type IconName = 'book' | 'crown' | 'gem' | 'paw' | 'ribbon' | 'sparkles' | 'star' | 'target' | 'trophy'

interface CollectionItem {
  id: string
  title: string
  category: Exclude<CollectionCategory, 'all'>
  rarity: 'Звичайна' | 'Особлива' | 'Рідкісна'
  icon: IconName
  description: string
  requirement: string
  tone: string
  unlocked: () => boolean
}

const profileStore = useProfileStore()
const gamification = ref<GamificationState>()
const progress = ref<TopicProgress[]>([])
const stats = ref<LearningStats>({
  completedLessons: 0,
  correctAttempts: 0,
  totalAttempts: 0,
  studyMinutes: 0,
  weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
})
const activeCategory = ref<CollectionCategory>('all')
const selectedItem = ref<CollectionItem>()
const loading = ref(true)

const masteredCount = computed(
  () => progress.value.filter((entry) => entry.status === 'mastered').length,
)
const accuracy = computed(() =>
  stats.value.totalAttempts
    ? Math.round((stats.value.correctAttempts / stats.value.totalAttempts) * 100)
    : 0,
)

const tabs: { id: CollectionCategory; label: string; icon: IconName }[] = [
  { id: 'all', label: 'Усі', icon: 'sparkles' },
  { id: 'stickers', label: 'Стікери', icon: 'paw' },
  { id: 'badges', label: 'Відзнаки', icon: 'trophy' },
  { id: 'accessories', label: 'Аксесуари', icon: 'ribbon' },
  { id: 'rare', label: 'Рідкісні', icon: 'gem' },
]

const catalog = computed<CollectionItem[]>(() => [
  {
    id: 'desk-pink-notebook',
    title: 'Рожевий зошит',
    category: 'stickers',
    rarity: 'Звичайна',
    icon: 'book',
    description: 'Перший зошит Мурки для охайних кроків і сміливих гіпотез.',
    requirement: 'Входить до стартового набору учениці.',
    tone: 'pink',
    unlocked: () =>
      gamification.value?.unlockedCosmeticIds.includes('desk-pink-notebook') ?? true,
  },
  {
    id: 'first-lesson-completed',
    title: 'Перші кроки',
    category: 'badges',
    rarity: 'Особлива',
    icon: 'paw',
    description: 'Відзнака за перше завершене заняття у Math Kitty Academy.',
    requirement: 'Завершити один повний урок.',
    tone: 'mint',
    unlocked: () =>
      gamification.value?.unlockedAchievementIds.includes('first-lesson-completed') ??
      stats.value.completedLessons > 0,
  },
  {
    id: 'bright-mind',
    title: 'Точний розум',
    category: 'badges',
    rarity: 'Рідкісна',
    icon: 'target',
    description: 'Сяє у тих, хто уважно перевіряє кожен математичний крок.',
    requirement: 'Досягти точності 80% або вище.',
    tone: 'blue',
    unlocked: () => accuracy.value >= 80,
  },
  {
    id: 'star-bow',
    title: 'Зоряний бантик',
    category: 'accessories',
    rarity: 'Рідкісна',
    icon: 'ribbon',
    description: 'Оксамитовий бантик із зіркою знань для особливих пригод.',
    requirement: 'Засвоїти першу тему.',
    tone: 'lavender',
    unlocked: () => masteredCount.value >= 1,
  },
  {
    id: 'hundred-xp',
    title: 'Медаль 100 XP',
    category: 'badges',
    rarity: 'Особлива',
    icon: 'star',
    description: 'Тепла золота медаль за стабільні маленькі кроки.',
    requirement: 'Зібрати 100 XP.',
    tone: 'gold',
    unlocked: () => (gamification.value?.xp ?? 0) >= 100,
  },
  {
    id: 'fraction-crown',
    title: 'Корона дробів',
    category: 'rare',
    rarity: 'Рідкісна',
    icon: 'crown',
    description: 'Мініатюрна корона майстрині рівних частин.',
    requirement: 'Засвоїти всі теми містечка дробів.',
    tone: 'pink',
    unlocked: () =>
      progress.value.filter(
        (entry) =>
          entry.status === 'mastered' &&
          ['fraction-meaning', 'comparing-fractions', 'equivalent-fractions'].includes(
            entry.topicId,
          ),
      ).length >= 3,
  },
  {
    id: 'crystal-calculator',
    title: 'Кришталевий калькулятор',
    category: 'rare',
    rarity: 'Рідкісна',
    icon: 'gem',
    description: 'Легендарна прикраса полиці для довгої математичної подорожі.',
    requirement: 'Зібрати 500 XP.',
    tone: 'blue',
    unlocked: () => (gamification.value?.xp ?? 0) >= 500,
  },
  {
    id: 'academy-champion',
    title: 'Чемпіонка академії',
    category: 'rare',
    rarity: 'Рідкісна',
    icon: 'trophy',
    description: 'Велика відзнака за завершення всього маршруту основ.',
    requirement: 'Засвоїти 15 тем.',
    tone: 'gold',
    unlocked: () => masteredCount.value >= 15,
  },
])

const filteredItems = computed(() =>
  activeCategory.value === 'all'
    ? catalog.value
    : catalog.value.filter((item) => item.category === activeCategory.value),
)
const unlockedCount = computed(() => catalog.value.filter((item) => item.unlocked()).length)

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (!profileId) return
  try {
    ;[gamification.value, progress.value, stats.value] = await Promise.all([
      learningRepository.getGamification(profileId),
      learningRepository.listTopicProgress(profileId),
      learningRepository.getLearningStats(profileId),
    ])
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="collection-page page-shell">
    <header class="collection-heading">
      <div>
        <span class="eyebrow">Альбом нагород Мурки</span>
        <h1>Моя колекція</h1>
        <p>
          Кожна річ тут нагадує про справжній навчальний крок — жодних випадкових
          подарунків.
        </p>
      </div>
      <div class="collection-counter">
        <AppIcon name="star" />
        <strong>{{ unlockedCount }}</strong>
        <span>із {{ catalog.length }} знайдено</span>
      </div>
    </header>

    <nav class="collection-tabs" aria-label="Категорії колекції">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeCategory === tab.id }"
        @click="activeCategory = tab.id"
      >
        <AppIcon :name="tab.icon" />
        {{ tab.label }}
      </button>
    </nav>

    <div v-if="loading" class="loading-state" role="status">
      <AppIcon name="sparkles" />
      Відкриваємо сторінки альбому…
    </div>

    <div v-else class="collection-album">
      <div class="album-rings" aria-hidden="true">
        <span v-for="ring in 7" :key="ring"></span>
      </div>
      <div class="collection-grid">
        <button
          v-for="item in filteredItems"
          :key="item.id"
          type="button"
          :class="['collection-item', `collection-item--${item.tone}`, { locked: !item.unlocked() }]"
          @click="selectedItem = item"
        >
          <span v-if="item.unlocked()" class="collection-item__art">
            <AppIcon :name="item.icon" />
            <i></i>
          </span>
          <span v-else class="collection-item__art collection-item__art--locked">
            <AppIcon name="lock" />
          </span>
          <span class="collection-item__copy">
            <small>{{ item.unlocked() ? item.rarity : 'Ще не відкрито' }}</small>
            <strong>{{ item.unlocked() ? item.title : 'Таємна нагорода' }}</strong>
          </span>
          <span
            v-if="item.id === 'first-lesson-completed' && item.unlocked()"
            class="new-ribbon"
          >
            Нове
          </span>
        </button>
      </div>
      <MascotCard
        class="album-mascot"
        mood="celebrating"
        message="Натисни на знахідку, щоб прочитати її історію."
        compact
      />
    </div>

    <div v-if="selectedItem" class="collection-modal-backdrop" @click.self="selectedItem = undefined">
      <aside class="collection-modal" role="dialog" aria-modal="true" :aria-labelledby="`item-${selectedItem.id}`">
        <button
          class="icon-button collection-modal__close"
          type="button"
          aria-label="Закрити перегляд нагороди"
          @click="selectedItem = undefined"
        >
          <AppIcon name="close" />
        </button>
        <div
          :class="[
            'collection-modal__art',
            `collection-modal__art--${selectedItem.tone}`,
            { locked: !selectedItem.unlocked() },
          ]"
        >
          <AppIcon :name="selectedItem.unlocked() ? selectedItem.icon : 'lock'" />
        </div>
        <span class="rarity-pill">{{ selectedItem.rarity }}</span>
        <h2 :id="`item-${selectedItem.id}`">
          {{ selectedItem.unlocked() ? selectedItem.title : 'Таємна нагорода' }}
        </h2>
        <p>{{ selectedItem.description }}</p>
        <div class="unlock-condition">
          <AppIcon :name="selectedItem.unlocked() ? 'check' : 'lock'" />
          <div>
            <strong>{{ selectedItem.unlocked() ? 'Нагороду відкрито' : 'Умова розблокування' }}</strong>
            <span>{{ selectedItem.requirement }}</span>
          </div>
        </div>
        <BaseButton @click="selectedItem = undefined">
          {{ selectedItem.unlocked() ? 'Повернути до альбому' : 'Зрозуміло, до пригод!' }}
        </BaseButton>
      </aside>
    </div>
  </section>
</template>
