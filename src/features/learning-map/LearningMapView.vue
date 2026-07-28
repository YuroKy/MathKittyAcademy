<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/base/AppIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
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

type RoomStatus = TopicProgress['status']

interface MapRoom {
  topic: CurriculumTopic
  status: RoomStatus
  mastery: number
  boss: boolean
}

const zoneDefinitions = [
  {
    id: 'foundation',
    title: 'Ліс чисел',
    subtitle: 'Стежки арифметики',
    icon: 'paw' as const,
  },
  {
    id: 'fractions',
    title: 'Містечко дробів',
    subtitle: 'Кондитерська рівних частин',
    icon: 'ribbon' as const,
  },
  {
    id: 'decimals-percent',
    title: 'Хмарна обсерваторія',
    subtitle: 'Десяткові зорі й відсотки',
    icon: 'star' as const,
  },
  {
    id: 'pre-algebra',
    title: 'Замок рівнянь',
    subtitle: 'Фінальна зала академії',
    icon: 'crown' as const,
  },
]

const router = useRouter()
const profileStore = useProfileStore()
const progress = ref<TopicProgress[]>([])
const selectedTopic = ref<CurriculumTopic>()
const progressMap = computed(() => new Map(progress.value.map((entry) => [entry.topicId, entry])))
const recommendation = computed(() => recommendNextTopic(curriculumTopics, progress.value))

const rooms = computed<MapRoom[]>(() =>
  curriculumTopics.map((topic) => {
    const derivedStatus = deriveTopicStatus(topic, progressMap.value)
    return {
      topic,
      status:
        recommendation.value?.id === topic.id && derivedStatus === 'ready'
          ? ('recommended' as const)
          : derivedStatus,
      mastery: progressMap.value.get(topic.id)?.mastery ?? 0,
      boss: [5, 10, 15].includes(topic.order),
    }
  }),
)

const zones = computed(() =>
  zoneDefinitions.map((zone) => ({
    ...zone,
    rooms: rooms.value.filter((room) => room.topic.groupId === zone.id),
  })),
)

const selectedRoom = computed(() =>
  rooms.value.find((room) => room.topic.id === selectedTopic.value?.id),
)
const prerequisiteGaps = computed(() =>
  selectedTopic.value
    ? missingPrerequisites(selectedTopic.value, curriculumTopics, progressMap.value)
    : [],
)

const statusLabels: Record<RoomStatus, string> = {
  recommended: 'Поточний урок',
  ready: 'Доступно',
  challenging: 'Потрібна підготовка',
  inProgress: 'У процесі',
  reviewNeeded: 'Час повторити',
  mastered: 'Засвоєно',
}

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (profileId) progress.value = await learningRepository.listTopicProgress(profileId)
})

function openTopic(topic: CurriculumTopic): void {
  selectedTopic.value = topic
}

function launchSelected(preview = false): void {
  if (!selectedTopic.value) return
  router.push({
    path: `/learn/${selectedTopic.value.id}`,
    query: preview ? { mode: 'preview' } : {},
  })
}
</script>

<template>
  <section class="map-page page-shell">
    <header class="map-heading">
      <div>
        <span class="eyebrow">Подорож магічною академією</span>
        <h1>Карта пригод</h1>
        <p>
          Обирай будь-яку видиму кімнату. Мурка підсвічує найзручніший маршрут,
          але досліджувати можна у власному темпі.
        </p>
      </div>
      <div class="map-legend" aria-label="Позначення карти">
        <span><i class="legend-dot legend-dot--done"></i> засвоєно</span>
        <span><i class="legend-dot legend-dot--current"></i> поточне</span>
        <span><i class="legend-dot legend-dot--ready"></i> доступно</span>
        <span><i class="legend-dot legend-dot--mist"></i> з підготовкою</span>
      </div>
    </header>

    <div class="adventure-board">
      <div class="board-ribbon">
        <span aria-hidden="true"><AppIcon name="sparkles" /></span>
        <strong>Від Лісу чисел до Замку рівнянь</strong>
        <span aria-hidden="true"><AppIcon name="sparkles" /></span>
      </div>

      <div class="map-zones">
        <section
          v-for="(zone, zoneIndex) in zones"
          :key="zone.id"
          :class="['map-zone', `map-zone--${zone.id}`]"
        >
          <header class="map-zone__header">
            <span><AppIcon :name="zone.icon" /></span>
            <div>
              <small>Локація {{ zoneIndex + 1 }}</small>
              <h2>{{ zone.title }}</h2>
              <p>{{ zone.subtitle }}</p>
            </div>
          </header>

          <ol class="zone-path">
            <li
              v-for="{ topic, status, mastery, boss } in zone.rooms"
              :key="topic.id"
              :class="[
                `map-room--${status}`,
                { 'map-room--boss': boss },
              ]"
            >
              <button
                type="button"
                class="map-room"
                :aria-label="`${topic.title}. ${statusLabels[status]}`"
                @click="openTopic(topic)"
              >
                <span class="map-room__node">
                  <AppIcon v-if="status === 'mastered'" name="check" />
                  <AppIcon v-else-if="status === 'challenging'" name="lock" />
                  <AppIcon v-else-if="boss" name="crown" />
                  <span v-else>{{ topic.order }}</span>
                </span>
                <img
                  v-if="status === 'recommended'"
                  class="map-room__token"
                  src="/murka-anime-avatar-v2.png"
                  alt=""
                  width="58"
                  height="58"
                />
                <span class="map-room__label">
                  <small>{{ statusLabels[status] }}</small>
                  <strong>{{ topic.title }}</strong>
                  <span v-if="status === 'mastered'" class="room-stars" aria-label="Три зірки">
                    <AppIcon name="star" />
                    <AppIcon name="star" />
                    <AppIcon name="star" />
                  </span>
                  <ProgressBar
                    v-else-if="mastery > 0"
                    :value="mastery"
                    :label="`${mastery}% засвоєння`"
                  />
                </span>
              </button>
            </li>
          </ol>

          <span class="zone-decoration zone-decoration--one" aria-hidden="true"></span>
          <span class="zone-decoration zone-decoration--two" aria-hidden="true"></span>
        </section>
      </div>
    </div>

    <div v-if="selectedTopic && selectedRoom" class="topic-modal-backdrop" @click.self="selectedTopic = undefined">
      <aside class="topic-modal" role="dialog" aria-modal="true" :aria-labelledby="`topic-${selectedTopic.id}`">
        <button
          class="icon-button topic-modal__close"
          type="button"
          aria-label="Закрити картку уроку"
          @click="selectedTopic = undefined"
        >
          <AppIcon name="close" />
        </button>

        <div :class="['topic-modal__crest', `topic-modal__crest--${selectedRoom.status}`]">
          <AppIcon v-if="selectedRoom.boss" name="crown" />
          <span v-else>{{ selectedTopic.order }}</span>
        </div>
        <span :class="['status-chip', `status-chip--${selectedRoom.status}`]">
          {{ statusLabels[selectedRoom.status] }}
        </span>
        <h2 v-if="selectedRoom.status === 'challenging'" class="topic-modal__prompt">
          Можна спробувати просто зараз
        </h2>
        <h2 v-else :id="`topic-${selectedTopic.id}`">{{ selectedTopic.title }}</h2>
        <h3 v-if="selectedRoom.status === 'challenging'" :id="`topic-${selectedTopic.id}`">
          {{ selectedTopic.title }}
        </h3>
        <p>{{ selectedTopic.shortDescription }}</p>

        <div class="topic-modal__facts">
          <span><AppIcon name="clock" /> {{ selectedTopic.estimatedMinutes }} хв</span>
          <span><AppIcon name="book" /> 3 вправи</span>
          <span><AppIcon name="star" /> +40 XP</span>
        </div>

        <div v-if="prerequisiteGaps.length" class="topic-modal__notice">
          <AppIcon name="sparkles" />
          <div>
            <strong>Мурка радить спершу пригадати:</strong>
            <span>{{ prerequisiteGaps.map((topic) => topic.title).join(', ') }}</span>
          </div>
        </div>

        <div class="topic-modal__actions">
          <BaseButton
            v-if="selectedRoom.status !== 'challenging' || findPilotLesson(selectedTopic.id)"
            @click="launchSelected(false)"
          >
            <AppIcon name="play" />
            {{ selectedRoom.status === 'inProgress' ? 'Продовжити урок' : 'Почати урок' }}
          </BaseButton>
          <BaseButton
            v-if="selectedRoom.status === 'challenging'"
            :variant="findPilotLesson(selectedTopic.id) ? 'secondary' : 'primary'"
            @click="launchSelected(true)"
          >
            Спробувати 3-хв прев’ю
          </BaseButton>
        </div>
      </aside>
    </div>
  </section>
</template>
