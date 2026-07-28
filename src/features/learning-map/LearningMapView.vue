<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/base/AppIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import {
  atlasLocations,
  atlasTopicCount,
  type AtlasLocation,
  type AtlasTopic,
} from '@/content/curriculum/atlas'
import { curriculumTopics, findTopic } from '@/content/curriculum/topics'
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
type AtlasTopicStatus = RoomStatus | 'planned'

interface MapRoom {
  topic: CurriculumTopic
  status: RoomStatus
  mastery: number
}

interface TopicSearchResult {
  location: AtlasLocation
  topic: AtlasTopic
}

const router = useRouter()
const profileStore = useProfileStore()
const firstAtlasLocation = atlasLocations[0]!
const progress = ref<TopicProgress[]>([])
const selectedTopic = ref<CurriculumTopic>()
const selectedAtlasTopic = ref<AtlasTopic>()
const selectedLocationId = ref(firstAtlasLocation.id)
const searchQuery = ref('')
const locationPanel = ref<HTMLElement>()

const progressMap = computed(() => new Map(progress.value.map((entry) => [entry.topicId, entry])))
const recommendation = computed(() => recommendNextTopic(curriculumTopics, progress.value))
const selectedLocation = computed(
  () =>
    atlasLocations.find((location) => location.id === selectedLocationId.value) ??
    firstAtlasLocation,
)

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
    }
  }),
)

const roomMap = computed(() => new Map(rooms.value.map((room) => [room.topic.id, room])))
const selectedRoom = computed(() =>
  rooms.value.find((room) => room.topic.id === selectedTopic.value?.id),
)
const prerequisiteGaps = computed(() =>
  selectedTopic.value
    ? missingPrerequisites(selectedTopic.value, curriculumTopics, progressMap.value)
    : [],
)
const completedLessons = computed(
  () => rooms.value.filter((room) => room.status === 'mastered').length,
)
const plannedPercent = computed(() => Math.round((completedLessons.value / atlasTopicCount) * 100))

const activeLocationId = computed(
  () =>
    atlasLocations.find((location) =>
      location.topics.some((topic) => topic.liveTopicId === recommendation.value?.id),
    )?.id,
)

const searchResults = computed<TopicSearchResult[]>(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('uk')
  if (query.length < 2) return []

  return atlasLocations
    .flatMap((location) =>
      location.topics
        .filter((topic) => topic.title.toLocaleLowerCase('uk').includes(query))
        .map((topic) => ({ location, topic })),
    )
    .slice(0, 12)
})

const statusLabels: Record<AtlasTopicStatus, string> = {
  recommended: 'Наступна пригода',
  ready: 'Урок доступний',
  challenging: 'Потрібна підготовка',
  inProgress: 'У процесі',
  reviewNeeded: 'Час повторити',
  mastered: 'Засвоєно',
  planned: 'На маршруті',
}

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (profileId) progress.value = await learningRepository.listTopicProgress(profileId)

  if (activeLocationId.value) {
    selectedLocationId.value = activeLocationId.value
  }
})

function locationStyle(location: AtlasLocation): Record<string, string> {
  return {
    '--atlas-light': location.palette.light,
    '--atlas-mid': location.palette.mid,
    '--atlas-dark': location.palette.dark,
    '--atlas-ink': location.palette.ink,
  }
}

function locationRange(location: AtlasLocation): string {
  const first = location.topics[0]?.order ?? 0
  const last = location.topics.at(-1)?.order ?? first
  return `${first}–${last}`
}

function liveLessonCount(location: AtlasLocation): number {
  return location.topics.filter((topic) => topic.liveTopicId).length
}

function masteredCount(location: AtlasLocation): number {
  return location.topics.filter(
    (topic) => topic.liveTopicId && roomMap.value.get(topic.liveTopicId)?.status === 'mastered',
  ).length
}

function atlasTopicStatus(topic: AtlasTopic): AtlasTopicStatus {
  if (!topic.liveTopicId) return 'planned'
  return roomMap.value.get(topic.liveTopicId)?.status ?? 'challenging'
}

function selectLocation(location: AtlasLocation, scroll = true): void {
  selectedLocationId.value = location.id
  selectedAtlasTopic.value = undefined

  if (scroll) {
    void nextTick(() => locationPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
}

function stepLocation(direction: -1 | 1): void {
  const nextIndex = Math.min(
    atlasLocations.length - 1,
    Math.max(0, selectedLocation.value.order - 1 + direction),
  )
  selectLocation(atlasLocations[nextIndex]!, false)
}

function openAtlasTopic(topic: AtlasTopic): void {
  selectedAtlasTopic.value = topic

  if (!topic.liveTopicId) return
  const liveTopic = findTopic(topic.liveTopicId)
  if (liveTopic) selectedTopic.value = liveTopic
}

function selectSearchResult(result: TopicSearchResult): void {
  searchQuery.value = ''
  selectLocation(result.location)
  selectedAtlasTopic.value = result.topic
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
  <section class="atlas-page page-shell">
    <header class="atlas-heading">
      <div class="atlas-heading__copy">
        <span class="eyebrow">Велика математична експедиція</span>
        <h1>Атлас пригод</h1>
        <p>
          21 казкова локація і {{ atlasTopicCount }} зупинок — від першої закономірності до задач,
          де маршрут треба винайти самостійно.
        </p>
      </div>

      <div class="atlas-progress-card">
        <span class="atlas-progress-card__mascot">
          <img src="/murka-anime-avatar-v2.png" alt="" width="64" height="64" />
        </span>
        <div>
          <small>Експедиція Мурки</small>
          <strong>{{ completedLessons }} із {{ atlasTopicCount }} тем</strong>
          <ProgressBar :value="plannedPercent" :label="`${plannedPercent}% великого маршруту`" />
        </div>
      </div>
    </header>

    <div class="atlas-toolbar">
      <label class="atlas-search">
        <AppIcon name="map" />
        <span class="sr-only">Знайти тему на карті</span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Знайти тему, наприклад «відсотки»"
          autocomplete="off"
        />
      </label>

      <div class="atlas-key" aria-label="Позначення карти">
        <span><i class="atlas-key__dot atlas-key__dot--live"></i> урок уже доступний</span>
        <span><i class="atlas-key__dot atlas-key__dot--planned"></i> майбутня зупинка</span>
        <span><AppIcon name="crown" /> фінальне випробування</span>
      </div>

      <div v-if="searchQuery.trim().length >= 2" class="atlas-search-results">
        <p v-if="searchResults.length === 0">На карті такої теми ще не знайдено.</p>
        <button
          v-for="result in searchResults"
          :key="result.topic.id"
          type="button"
          @click="selectSearchResult(result)"
        >
          <span>{{ result.topic.order }}</span>
          <strong>{{ result.topic.title }}</strong>
          <small>{{ result.location.shortName }}</small>
        </button>
      </div>
    </div>

    <div class="atlas-board">
      <div class="atlas-board__title">
        <span><AppIcon name="sparkles" /></span>
        <strong>Обери локацію експедиції</strong>
        <span><AppIcon name="sparkles" /></span>
      </div>

      <div class="atlas-world-route" aria-label="Локації математичного світу">
        <article
          v-for="location in atlasLocations"
          :key="location.id"
          :style="locationStyle(location)"
          :class="[
            'atlas-location-card',
            {
              'atlas-location-card--selected': location.id === selectedLocation.id,
              'atlas-location-card--active': location.id === activeLocationId,
            },
          ]"
        >
          <button type="button" @click="selectLocation(location)">
            <span class="atlas-location-card__number">{{
              String(location.order).padStart(2, '0')
            }}</span>
            <span class="atlas-location-card__scene" aria-hidden="true">
              <i class="atlas-location-card__sun"></i>
              <i class="atlas-location-card__hill atlas-location-card__hill--back"></i>
              <i class="atlas-location-card__hill atlas-location-card__hill--front"></i>
              <b>{{ location.symbol }}</b>
            </span>
            <span class="atlas-location-card__copy">
              <small>Теми {{ locationRange(location) }}</small>
              <strong>{{ location.shortName }}</strong>
              <span>{{ location.subtitle }}</span>
            </span>
            <span class="atlas-location-card__meta">
              <em>{{ location.topics.length }} зупинок</em>
              <em v-if="liveLessonCount(location)">
                {{ masteredCount(location) }}/{{ liveLessonCount(location) }} уроків
              </em>
              <em v-else>маршрут спроєктовано</em>
            </span>
          </button>
        </article>
      </div>
    </div>

    <section
      ref="locationPanel"
      class="atlas-location-panel"
      :style="locationStyle(selectedLocation)"
      aria-live="polite"
    >
      <header class="atlas-location-hero">
        <div class="atlas-location-hero__landscape" aria-hidden="true">
          <i class="atlas-location-hero__orb"></i>
          <i class="atlas-location-hero__ridge atlas-location-hero__ridge--back"></i>
          <i class="atlas-location-hero__ridge atlas-location-hero__ridge--front"></i>
          <span>{{ selectedLocation.symbol }}</span>
        </div>

        <div class="atlas-location-hero__copy">
          <span class="eyebrow"
            >Локація {{ selectedLocation.order }} із {{ atlasLocations.length }}</span
          >
          <h2>{{ selectedLocation.name }}</h2>
          <p>{{ selectedLocation.description }}</p>
          <div>
            <span><AppIcon name="map" /> {{ selectedLocation.topics.length }} зупинок</span>
            <span><AppIcon name="star" /> {{ selectedLocation.landmark }}</span>
          </div>
        </div>

        <div class="atlas-location-hero__nav">
          <button
            type="button"
            aria-label="Попередня локація"
            :disabled="selectedLocation.order === 1"
            @click="stepLocation(-1)"
          >
            ←
          </button>
          <span>{{ selectedLocation.order }} / {{ atlasLocations.length }}</span>
          <button
            type="button"
            aria-label="Наступна локація"
            :disabled="selectedLocation.order === atlasLocations.length"
            @click="stepLocation(1)"
          >
            →
          </button>
        </div>
      </header>

      <div class="atlas-trail-heading">
        <div>
          <span class="eyebrow">Стежка знань</span>
          <h3>Зупинки цієї локації</h3>
        </div>
        <p>Кожна зупинка відкриває наступну ідею, а корона завершує цілий розділ.</p>
      </div>

      <ol class="atlas-topic-trail">
        <li
          v-for="topic in selectedLocation.topics"
          :key="topic.id"
          :class="[
            `atlas-topic-stop--${atlasTopicStatus(topic)}`,
            {
              'atlas-topic-stop--boss': topic.isBoss,
              'atlas-topic-stop--selected': topic.id === selectedAtlasTopic?.id,
            },
          ]"
        >
          <button
            type="button"
            :aria-label="`${topic.title}. ${statusLabels[atlasTopicStatus(topic)]}`"
            @click="openAtlasTopic(topic)"
          >
            <span class="atlas-topic-stop__node">
              <AppIcon v-if="atlasTopicStatus(topic) === 'mastered'" name="check" />
              <AppIcon v-else-if="topic.isBoss" name="crown" />
              <span v-else>{{ topic.order }}</span>
            </span>
            <span class="atlas-topic-stop__copy">
              <small>{{ statusLabels[atlasTopicStatus(topic)] }}</small>
              <strong>{{ topic.title }}</strong>
            </span>
            <AppIcon v-if="topic.liveTopicId" class="atlas-topic-stop__arrow" name="arrow-right" />
          </button>
        </li>
      </ol>

      <aside
        v-if="selectedAtlasTopic && !selectedAtlasTopic.liveTopicId"
        class="atlas-planned-note"
      >
        <span class="atlas-planned-note__number">{{ selectedAtlasTopic.order }}</span>
        <div>
          <small>Майбутня зупинка маршруту</small>
          <strong>{{ selectedAtlasTopic.title }}</strong>
          <p>
            Місце теми в повній програмі вже визначене. Інтерактивний урок з’явиться тут, не
            змінюючи послідовність подорожі.
          </p>
        </div>
        <AppIcon name="sparkles" />
      </aside>
    </section>

    <div
      v-if="selectedTopic && selectedRoom"
      class="topic-modal-backdrop"
      @click.self="selectedTopic = undefined"
    >
      <aside
        class="topic-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`topic-${selectedTopic.id}`"
      >
        <button
          class="icon-button topic-modal__close"
          type="button"
          aria-label="Закрити картку уроку"
          @click="selectedTopic = undefined"
        >
          <AppIcon name="close" />
        </button>

        <div :class="['topic-modal__crest', `topic-modal__crest--${selectedRoom.status}`]">
          <span>{{ selectedTopic.order }}</span>
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
