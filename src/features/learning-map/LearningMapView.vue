<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { curriculumTopics } from '@/content/curriculum/topics'
import {
  deriveTopicStatus,
  missingPrerequisites,
} from '@/domain/learning/prerequisites'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { CurriculumTopic, TopicProgress } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()
const progress = ref<TopicProgress[]>([])
const selectedLockedTopic = ref<CurriculumTopic>()
const progressMap = computed(() => new Map(progress.value.map((entry) => [entry.topicId, entry])))

const rooms = computed(() =>
  curriculumTopics.map((topic) => ({
    topic,
    status: deriveTopicStatus(topic, progressMap.value),
    mastery: progressMap.value.get(topic.id)?.mastery ?? 0,
  })),
)

const lockedReasons = computed(() =>
  selectedLockedTopic.value
    ? missingPrerequisites(selectedLockedTopic.value, curriculumTopics, progressMap.value)
    : [],
)

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (profileId) progress.value = await learningRepository.listTopicProgress(profileId)
})

function openTopic(topic: CurriculumTopic, status: string): void {
  if (status === 'locked') {
    selectedLockedTopic.value = topic
    return
  }
  router.push(`/learn/${topic.id}`)
}

const statusLabels = {
  locked: 'Закрито',
  available: 'Доступно',
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
      <p>Складніші кімнати відкриваються, коли для них уже є надійна основа.</p>
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
              {{ status === 'mastered' ? '✓' : status === 'locked' ? '⌁' : topic.order }}
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

      <aside v-if="selectedLockedTopic" class="locked-explanation" role="status">
        <button
          class="icon-button"
          type="button"
          aria-label="Закрити пояснення"
          @click="selectedLockedTopic = undefined"
        >
          ×
        </button>
        <span class="locked-explanation__icon" aria-hidden="true">⌁</span>
        <h2>Кімната ще готується</h2>
        <p>
          Щоб перейти до теми «{{ selectedLockedTopic.title }}», спершу зміцни:
        </p>
        <ul>
          <li v-for="topic in lockedReasons" :key="topic.id">{{ topic.title }}</li>
        </ul>
        <button
          v-if="lockedReasons[0]"
          class="base-button base-button--primary"
          type="button"
          @click="router.push(`/learn/${lockedReasons[0]?.id}`)"
        >
          Перейти до першої передумови
        </button>
      </aside>
    </div>
  </section>
</template>
