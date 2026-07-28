<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { curriculumTopics } from '@/content/curriculum/topics'
import { findPilotLesson } from '@/content/lessons/pilotLessons'
import {
  deriveTopicStatus,
  missingPrerequisites,
  recommendNextTopic,
} from '@/domain/learning/prerequisites'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { CurriculumTopic, TopicProgress } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()
const progress = ref<TopicProgress[]>([])
const selectedTopic = ref<CurriculumTopic>()
const progressMap = computed(() => new Map(progress.value.map((entry) => [entry.topicId, entry])))
const recommendation = computed(() => recommendNextTopic(curriculumTopics, progress.value))

const rooms = computed(() =>
  curriculumTopics.map((topic) => {
    const derivedStatus = deriveTopicStatus(topic, progressMap.value)
    return {
      topic,
      status:
        recommendation.value?.id === topic.id && derivedStatus === 'ready'
          ? ('recommended' as const)
          : derivedStatus,
      mastery: progressMap.value.get(topic.id)?.mastery ?? 0,
    }
  }),
)

const prerequisiteGaps = computed(() =>
  selectedTopic.value
    ? missingPrerequisites(selectedTopic.value, curriculumTopics, progressMap.value)
    : [],
)

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (profileId) progress.value = await learningRepository.listTopicProgress(profileId)
})

function openTopic(topic: CurriculumTopic, status: TopicProgress['status']): void {
  if (status === 'challenging') {
    selectedTopic.value = topic
    return
  }
  router.push(`/learn/${topic.id}`)
}

const statusLabels = {
  recommended: 'Рекомендовано',
  ready: 'Можна починати',
  challenging: 'Можна спробувати',
  inProgress: 'У процесі',
  reviewNeeded: 'Час повторити',
  mastered: 'Засвоєно',
}
</script>

<template>
  <section class="map-page page-shell">
    <header class="page-heading page-heading--left">
      <span class="eyebrow">Подорож академією</span>
      <h1>Карта навчання</h1>
      <p>
        Усі кімнати відкриті. Ми підказуємо комфортний маршрут, але остаточний вибір
        завжди за тобою.
      </p>
    </header>

    <div class="map-layout">
      <ol class="topic-journey">
        <li
          v-for="{ topic, status, mastery } in rooms"
          :key="topic.id"
          :class="[`topic-node--${status}`]"
        >
          <button type="button" class="topic-node" @click="openTopic(topic, status)">
            <span class="topic-node__marker" aria-hidden="true">
              {{ status === 'mastered' ? '✓' : status === 'challenging' ? '◇' : topic.order }}
            </span>
            <span class="topic-node__copy">
              <span class="topic-node__meta">
                Кімната {{ topic.order }}
                <span :class="['status-chip', `status-chip--${status}`]">
                  {{ statusLabels[status] }}
                </span>
              </span>
              <strong>{{ topic.title }}</strong>
              <small>{{ topic.shortDescription }}</small>
              <span v-if="mastery > 0" class="topic-node__mastery">
                Засвоєння: {{ mastery }}%
              </span>
            </span>
            <span class="topic-node__arrow" aria-hidden="true">→</span>
          </button>
        </li>
      </ol>

      <aside v-if="selectedTopic" class="locked-explanation topic-choice-panel" role="dialog" aria-modal="false">
        <button
          class="icon-button"
          type="button"
          aria-label="Закрити пояснення"
          @click="selectedTopic = undefined"
        >
          ×
        </button>
        <span class="locked-explanation__icon" aria-hidden="true">◇</span>
        <span class="eyebrow">Вільне дослідження</span>
        <h2>Можна спробувати просто зараз</h2>
        <p>
          У темі «{{ selectedTopic.title }}» зустрінуться знання, які ми ще не
          практикували:
        </p>
        <ul>
          <li v-for="topic in prerequisiteGaps" :key="topic.id">{{ topic.title }}</li>
        </ul>
        <div class="topic-choice-panel__actions">
          <button
            class="base-button base-button--primary"
            type="button"
            @click="router.push(`/learn/${selectedTopic?.id}?mode=preview`)"
          >
            Спробувати 3-хв прев’ю
          </button>
          <button
            v-if="findPilotLesson(selectedTopic.id)"
            class="base-button base-button--secondary"
            type="button"
            @click="router.push(`/learn/${selectedTopic?.id}`)"
          >
            Відкрити повний урок
          </button>
          <span v-else class="topic-choice-panel__soon">
            Повний урок готується · прев’ю вже працює
          </span>
          <button
            v-if="prerequisiteGaps[0]"
            class="text-button"
            type="button"
            @click="router.push(`/learn/${prerequisiteGaps[0]?.id}`)"
          >
            Спочатку підготуватися
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>
