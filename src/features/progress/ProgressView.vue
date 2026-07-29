<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AppIcon from '@/components/base/AppIcon.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { curriculumTopics } from '@/content/curriculum/topics'
import {
  learningRepository,
  type LearningStats,
} from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { GamificationState, SchoolGrade, TopicProgress } from '@/types/domain'

const profileStore = useProfileStore()
const gamification = ref<GamificationState>()
const topicProgress = ref<TopicProgress[]>([])
const stats = ref<LearningStats>({
  completedLessons: 0,
  correctAttempts: 0,
  totalAttempts: 0,
  studyMinutes: 0,
  weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
  firstAttemptAccuracy: 0,
  finalCompletionRate: 0,
  hintedCorrectAttempts: 0,
  reviewAccuracy: 0,
  commonErrorTypes: [],
})
const loading = ref(true)
const errorMessage = ref('')

const accuracy = computed(() => stats.value.firstAttemptAccuracy)
const levelProgress = computed(() => (gamification.value?.xp ?? 0) % 100)
const maxActivity = computed(() => Math.max(...stats.value.weeklyMinutes, 15))
const masteredCount = computed(
  () => topicProgress.value.filter((entry) => entry.status === 'mastered').length,
)

const weekdayLabels = computed(() => {
  const today = new Date()
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today)
    day.setDate(today.getDate() - (6 - index))
    return new Intl.DateTimeFormat('uk-UA', { weekday: 'short' }).format(day).replace('.', '')
  })
})

const topicGroups = computed(() => {
  const definitions: {
    grade: SchoolGrade
    title: string
    icon: 'paw' | 'ribbon' | 'star' | 'crown' | 'target'
    tone: string
  }[] = [
    { grade: 1, title: '1 клас', icon: 'paw' as const, tone: 'mint' },
    { grade: 2, title: '2 клас', icon: 'ribbon' as const, tone: 'blue' },
    { grade: 3, title: '3 клас', icon: 'star' as const, tone: 'lavender' },
    { grade: 4, title: '4 клас', icon: 'crown' as const, tone: 'pink' },
    { grade: 5, title: '5 клас', icon: 'paw' as const, tone: 'pink' },
    { grade: 6, title: '6 клас', icon: 'ribbon' as const, tone: 'mint' },
    { grade: 7, title: '7 клас', icon: 'star' as const, tone: 'blue' },
    { grade: 8, title: '8 клас', icon: 'crown' as const, tone: 'lavender' },
    { grade: 9, title: '9 клас', icon: 'target' as const, tone: 'pink' },
  ]

  return definitions.map((group) => {
    const topics = curriculumTopics.filter((topic) => topic.gradeLevels.includes(group.grade))
    const mastery =
      topics.reduce(
        (sum, topic) =>
          sum +
          (topicProgress.value.find((progress) => progress.topicId === topic.id)?.mastery ?? 0),
        0,
      ) / topics.length
    return { ...group, mastery: Math.round(mastery) }
  })
})

const achievements = computed(() => [
  {
    title: 'Перші кроки',
    detail: 'Завершено перший урок',
    icon: 'paw' as const,
    unlocked: stats.value.completedLessons > 0,
  },
  {
    title: 'Точний розум',
    detail: 'Точність відповідей 80%+',
    icon: 'target' as const,
    unlocked: accuracy.value >= 80,
  },
  {
    title: 'Тиждень чемпіона',
    detail: '7 днів поспіль',
    icon: 'trophy' as const,
    unlocked: (gamification.value?.currentStreak ?? 0) >= 7,
  },
  {
    title: 'Зоряна учениця',
    detail: 'Зібрано 500 XP',
    icon: 'star' as const,
    unlocked: (gamification.value?.xp ?? 0) >= 500,
  },
])

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (!profileId) return
  try {
    ;[gamification.value, topicProgress.value, stats.value] = await Promise.all([
      learningRepository.getGamification(profileId),
      learningRepository.listTopicProgress(profileId),
      learningRepository.getLearningStats(profileId),
    ])
  } catch {
    errorMessage.value = 'Не вдалося прочитати локальну статистику.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="progress-page page-shell">
    <header class="page-heading progress-heading">
      <span class="eyebrow">Щоденник учениці магічної академії</span>
      <h1>Мій прогрес</h1>
      <p>Усі цифри тут походять із твоїх локально збережених занять.</p>
    </header>

    <div v-if="loading" class="loading-state" role="status">
      <AppIcon name="sparkles" />
      Перегортаємо сторінки щоденника…
    </div>

    <div v-else-if="errorMessage" class="lesson-error" role="alert">{{ errorMessage }}</div>
    <div v-else class="progress-book">
      <section class="progress-book__page progress-book__page--left">
        <article class="level-journal-card">
          <div class="journal-level-crest">
            <AppIcon name="crown" />
            <strong>{{ gamification?.level ?? 1 }}</strong>
            <small>рівень</small>
          </div>
          <div>
            <span class="eyebrow">Загальний рівень</span>
            <h2>Профіль {{ profileStore.activeProfile?.name }}</h2>
            <ProgressBar
              :value="levelProgress"
              :label="`${gamification?.xp ?? 0} XP · ще ${100 - levelProgress} до наступного рівня`"
            />
            <div class="streak-week">
              <span v-for="(day, index) in weekdayLabels" :key="`${day}-${index}`">
                <i :class="{ active: index >= 7 - (gamification?.currentStreak ?? 0) }">
                  <AppIcon name="check" />
                </i>
                {{ day }}
              </span>
            </div>
          </div>
        </article>

        <div class="journal-stat-grid">
          <article>
            <span class="journal-stat__icon journal-stat__icon--mint">
              <AppIcon name="book" />
            </span>
            <small>Завершено уроків</small>
            <strong>{{ stats.completedLessons }}</strong>
            <p>{{ masteredCount }} тем засвоєно</p>
          </article>
          <article>
            <span class="journal-stat__icon journal-stat__icon--blue">
              <AppIcon name="target" />
            </span>
            <small>Точність</small>
            <strong>{{ accuracy }}%</strong>
            <p>Фінально виконано {{ stats.finalCompletionRate }}% · review {{ stats.reviewAccuracy }}%</p>
          </article>
          <article>
            <span class="journal-stat__icon journal-stat__icon--lavender">
              <AppIcon name="clock" />
            </span>
            <small>Час навчання</small>
            <strong
              >{{ Math.floor(stats.studyMinutes / 60) }} год
              {{ stats.studyMinutes % 60 }} хв</strong
            >
            <p>за завершеними заняттями</p>
          </article>
          <article class="journal-mascot-note">
            <MascotCard
              mood="celebrating"
              :message="
                stats.completedLessons
                  ? 'Ти повертаєшся до складного й не здаєшся — це справжня математична магія.'
                  : 'Перша зірка вже зовсім близько. Відкрий карту й обери комфортний урок.'
              "
              compact
            />
          </article>
          <article>
            <span class="journal-stat__icon journal-stat__icon--pink">
              <AppIcon name="sparkles" />
            </span>
            <small>Підказки й клубочки</small>
            <strong>{{ stats.hintedCorrectAttempts }} з підказкою</strong>
            <p v-if="stats.commonErrorTypes.length">
              Частіше трапляється: {{ stats.commonErrorTypes.map((entry) => `${entry.type} · ${entry.count}`).join(', ') }}
            </p>
            <p v-else>Ще недостатньо даних для закономірностей</p>
          </article>
        </div>
      </section>

      <section class="progress-book__page progress-book__page--right">
        <article class="activity-card">
          <div class="card-heading">
            <span class="card-heading__icon card-heading__icon--pink">
              <AppIcon name="chart" />
            </span>
            <div>
              <span class="eyebrow">Останні 7 днів</span>
              <h2>Активність за тиждень</h2>
            </div>
          </div>
          <div class="activity-chart" aria-label="Хвилини навчання за останні сім днів">
            <div
              v-for="(minutes, index) in stats.weeklyMinutes"
              :key="`${weekdayLabels[index]}-${index}`"
              class="activity-bar"
            >
              <strong>{{ minutes }} хв</strong>
              <span>
                <i :style="{ height: `${Math.max(8, (minutes / maxActivity) * 100)}%` }"></i>
              </span>
              <small>{{ weekdayLabels[index] }}</small>
            </div>
          </div>
        </article>

        <article class="topic-progress-card">
          <div class="card-heading">
            <span class="card-heading__icon card-heading__icon--lavender">
              <AppIcon name="sparkles" />
            </span>
            <div>
              <span class="eyebrow">Навчальні світи</span>
              <h2>Прогрес за темами</h2>
            </div>
          </div>
          <div class="topic-progress-list">
            <div v-for="group in topicGroups" :key="group.grade">
              <span :class="['topic-progress-icon', `topic-progress-icon--${group.tone}`]">
                <AppIcon :name="group.icon" />
              </span>
              <strong>{{ group.title }}</strong>
              <ProgressBar :value="group.mastery" :label="`${group.mastery}%`" />
            </div>
          </div>
        </article>

        <article class="achievement-shelf">
          <div class="card-heading">
            <span class="card-heading__icon card-heading__icon--gold">
              <AppIcon name="trophy" />
            </span>
            <div>
              <span class="eyebrow">Колекційна полиця</span>
              <h2>Останні досягнення</h2>
            </div>
          </div>
          <div class="achievement-row">
            <div
              v-for="achievement in achievements"
              :key="achievement.title"
              :class="{ locked: !achievement.unlocked }"
            >
              <span><AppIcon :name="achievement.unlocked ? achievement.icon : 'lock'" /></span>
              <strong>{{ achievement.title }}</strong>
              <small>{{ achievement.detail }}</small>
            </div>
          </div>
        </article>
      </section>
    </div>
  </section>
</template>
