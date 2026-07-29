<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/base/AppIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { curriculumTopics } from '@/content/curriculum/topics'
import { recommendNextTopic } from '@/domain/learning/prerequisites'
import {
  learningRepository,
  type LearningStats,
} from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { GamificationState, TopicProgress } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()
const topicProgress = ref<TopicProgress[]>([])
const gamification = ref<GamificationState>()
const dueReviews = ref(0)
const learningStats = ref<LearningStats>({
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

const nextTopic = computed(() => recommendNextTopic(curriculumTopics, topicProgress.value))
const nextProgress = computed(
  () => topicProgress.value.find((entry) => entry.topicId === nextTopic.value?.id)?.mastery ?? 0,
)
const levelProgress = computed(() => (gamification.value?.xp ?? 0) % 100)
const dailyMinutes = computed(() => learningStats.value.weeklyMinutes.at(-1) ?? 0)
const masteredTopics = computed(
  () => topicProgress.value.filter((entry) => entry.status === 'mastered').length,
)
const accuracy = computed(() => learningStats.value.firstAttemptAccuracy)
const questProgress = computed(() => Math.min(masteredTopics.value, 5))
const primaryAction = computed(() => {
  if (dueReviews.value > 0) {
    return {
      route: '/review',
      label: 'Почати повторення',
      reason: `${dueReviews.value} вправ очікують у черзі повторення.`,
    }
  }
  if (
    !profileStore.activeProfile?.diagnosticCompletedAt &&
    !profileStore.activeProfile?.diagnosticSkippedAt
  ) {
    return {
      route: '/diagnostic',
      label: 'Пройти діагностику',
      reason: 'Коротка діагностика допоможе обрати зручну стартову тему.',
    }
  }
  return {
    route: nextTopic.value ? `/learn/${nextTopic.value.id}` : '/map',
    label: nextProgress.value > 0 ? 'Продовжити навчання' : 'Почати заняття',
    reason: nextTopic.value
      ? `Наступний рекомендований крок: ${nextTopic.value.title}.`
      : 'Обери наступну тему на карті.',
  }
})

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (!profileId) return

  try {
    ;[topicProgress.value, gamification.value, dueReviews.value, learningStats.value] =
      await Promise.all([
        learningRepository.listTopicProgress(profileId),
        learningRepository.getGamification(profileId),
        learningRepository.countDueReviews(profileId),
        learningRepository.getLearningStats(profileId),
      ])
  } catch {
    errorMessage.value = 'Не вдалося прочитати локальний прогрес. Спробуй оновити сторінку.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="dashboard page-shell">
    <div v-if="loading" class="loading-state" role="status">
      <AppIcon name="sparkles" />
      Мурка розкладає книжки до заняття…
    </div>

    <div v-else-if="errorMessage" class="lesson-error" role="alert">
      <p>{{ errorMessage }}</p>
      <BaseButton @click="router.go(0)">Спробувати ще раз</BaseButton>
    </div>
    <template v-else>
      <div class="home-hero-grid">
        <article class="academy-hero">
          <div class="academy-hero__sparkles" aria-hidden="true"></div>
          <div class="academy-hero__copy">
            <span class="eyebrow">Магічний кабінет математики</span>
            <h1>Привіт, {{ profileStore.activeProfile?.name }}!</h1>
            <p>Один невеликий крок — і сьогоднішня сторінка щоденника засяє новою зіркою.</p>

            <div class="hero-level">
              <span class="level-crest">
                <AppIcon name="crown" />
                <strong>{{ gamification?.level ?? 1 }}</strong>
              </span>
              <div>
                <span>Рівень {{ gamification?.level ?? 1 }}</span>
                <ProgressBar
                  :value="levelProgress"
                  :label="`${levelProgress} / 100 XP до нового рівня`"
                />
              </div>
            </div>

            <BaseButton
              class="hero-cta"
              @click="router.push(primaryAction.route)"
            >
              <AppIcon name="play" />
              {{ primaryAction.label }}
            </BaseButton>
            <small>{{ primaryAction.reason }}</small>
          </div>

          <div class="academy-hero__mascot">
            <MascotCard
              mood="encouraging"
              message="Олівець нагострено, магічну книжку відкрито. Рушаймо!"
            />
          </div>
        </article>

        <aside class="home-side-stack">
          <article class="streak-card">
            <span class="streak-card__icon"><AppIcon name="flame" /></span>
            <div>
              <span class="eyebrow">Щоденна серія</span>
              <strong>{{ gamification?.currentStreak ?? 0 }} днів поспіль</strong>
              <p>Навіть 10 хвилин підтримають ритм.</p>
            </div>
          </article>

          <article class="quest-card">
            <div class="card-heading">
              <span class="card-heading__icon card-heading__icon--blue">
                <AppIcon name="book" />
              </span>
              <div>
                <span class="eyebrow">Поточний квест</span>
                <h2>Магія рівнянь</h2>
              </div>
            </div>
            <p>Засвой 5 тем, щоб відкрити першу сторінку альбому досягнень.</p>
            <ProgressBar :value="questProgress" :max="5" :label="`${questProgress} / 5 тем`" />
            <div class="quest-reward">
              <span><AppIcon name="star" /> +150 XP</span>
              <span><AppIcon name="gem" /> рідкісна наліпка</span>
            </div>
          </article>
        </aside>
      </div>

      <div class="home-dashboard-grid">
        <article class="game-card daily-card">
          <div class="card-heading">
            <span class="card-heading__icon"><AppIcon name="calendar" /></span>
            <div>
              <span class="eyebrow">Сьогодні</span>
              <h2>Денні завдання</h2>
            </div>
          </div>

          <div class="task-list">
            <button type="button" @click="nextTopic && router.push(`/learn/${nextTopic.id}`)">
              <span class="task-icon task-icon--pink"><AppIcon name="book" /></span>
              <span>
                <strong>Навчайся {{ profileStore.activeProfile?.dailyGoalMinutes }} хв</strong>
                <small>{{ dailyMinutes }} хв уже зараховано</small>
                <ProgressBar
                  :value="dailyMinutes"
                  :max="profileStore.activeProfile?.dailyGoalMinutes ?? 10"
                  label="Щоденна ціль"
                />
              </span>
              <AppIcon name="arrow-right" />
            </button>
            <button type="button" @click="router.push('/review')">
              <span class="task-icon task-icon--blue"><AppIcon name="target" /></span>
              <span>
                <strong>Повтори складні кроки</strong>
                <small>{{ dueReviews }} вправ у черзі на сьогодні</small>
              </span>
              <AppIcon name="arrow-right" />
            </button>
            <button type="button" @click="router.push('/map')">
              <span class="task-icon task-icon--gold"><AppIcon name="map" /></span>
              <span>
                <strong>Відкрий нову кімнату</strong>
                <small>{{ masteredTopics }} із {{ curriculumTopics.length }} тем засвоєно</small>
              </span>
              <AppIcon name="arrow-right" />
            </button>
            <button type="button" @click="router.push('/mistakes')">
              <span class="task-icon task-icon--pink"><AppIcon name="sparkles" /></span>
              <span>
                <strong>Заплутані клубочки</strong>
                <small>Повернися до помилок і спробуй схожий крок</small>
              </span>
              <AppIcon name="arrow-right" />
            </button>
          </div>
        </article>

        <article class="game-card quick-progress-card">
          <div class="card-heading">
            <span class="card-heading__icon card-heading__icon--lavender">
              <AppIcon name="chart" />
            </span>
            <div>
              <span class="eyebrow">Мій прогрес</span>
              <h2>Коротка статистика</h2>
            </div>
          </div>
          <div class="quick-stats">
            <div>
              <span><AppIcon name="book" /></span>
              <strong>{{ learningStats.completedLessons }}</strong>
              <small>уроків завершено</small>
            </div>
            <div>
              <span><AppIcon name="target" /></span>
              <strong>{{ accuracy }}%</strong>
              <small>правильних відповідей</small>
            </div>
            <div>
              <span><AppIcon name="trophy" /></span>
              <strong>{{ masteredTopics }}</strong>
              <small>тем засвоєно</small>
            </div>
            <div>
              <span><AppIcon name="star" /></span>
              <strong>{{ gamification?.xp ?? 0 }}</strong>
              <small>зірок досвіду</small>
            </div>
          </div>
          <button class="card-link" type="button" @click="router.push('/progress')">
            Детальна статистика
            <AppIcon name="arrow-right" />
          </button>
        </article>

        <article class="game-card rewards-card">
          <div class="card-heading">
            <span class="card-heading__icon card-heading__icon--gold">
              <AppIcon name="gift" />
            </span>
            <div>
              <span class="eyebrow">Нагороди</span>
              <h2>Останні знахідки</h2>
            </div>
          </div>
          <div class="reward-stickers">
            <span class="reward-sticker reward-sticker--paw"><AppIcon name="paw" /></span>
            <span class="reward-sticker reward-sticker--book"><AppIcon name="book" /></span>
            <span class="reward-sticker reward-sticker--star"><AppIcon name="star" /></span>
            <span
              :class="[
                'reward-sticker',
                'reward-sticker--ribbon',
                { 'reward-sticker--locked': !gamification?.unlockedAchievementIds.length },
              ]"
            >
              <AppIcon :name="gamification?.unlockedAchievementIds.length ? 'ribbon' : 'lock'" />
            </span>
          </div>
          <button class="card-link" type="button" @click="router.push('/collection')">
            Переглянути альбом
            <AppIcon name="arrow-right" />
          </button>
        </article>

        <article class="game-card map-preview-card">
          <div class="map-preview-card__copy">
            <span class="eyebrow">Наступна зупинка</span>
            <h2>{{ nextTopic?.title ?? 'Перша кімната академії' }}</h2>
            <p>{{ nextTopic?.shortDescription }}</p>
            <BaseButton variant="secondary" @click="router.push('/map')">
              Відкрити карту
              <AppIcon name="arrow-right" />
            </BaseButton>
          </div>
          <div class="mini-map" aria-hidden="true">
            <span class="mini-map__island mini-map__island--one"></span>
            <span class="mini-map__island mini-map__island--two"></span>
            <span class="mini-map__island mini-map__island--three"></span>
            <span class="mini-map__path"></span>
            <span class="mini-map__node mini-map__node--done"><AppIcon name="check" /></span>
            <span class="mini-map__node mini-map__node--current">
              {{ nextTopic?.order ?? 1 }}
            </span>
            <span class="mini-map__node mini-map__node--locked"><AppIcon name="lock" /></span>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>
