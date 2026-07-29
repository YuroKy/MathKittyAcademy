<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/base/AppIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import ContentTags from '@/components/learning/ContentTags.vue'
import { useDialogFocus } from '@/composables/useDialogFocus'
import {
  atlasLocations,
  atlasTopicCount,
  type AtlasLocation,
  type AtlasTopic,
} from '@/content/curriculum/atlas'
import { curriculumTopics, findTopic } from '@/content/curriculum/topics'
import { findFullLesson } from '@/content/lessons/fullLessons'
import {
  deriveTopicStatus,
  missingPrerequisites,
  recommendNextTopic,
} from '@/domain/learning/prerequisites'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { CurriculumTopic, SchoolGrade, TopicProgress } from '@/types/domain'

type RoomStatus = TopicProgress['status']
type AtlasTopicStatus = RoomStatus | 'planned'
type AtlasGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type AtlasGradeFilter = AtlasGrade | 'all'

interface MapRoom {
  topic: CurriculumTopic
  status: RoomStatus
  mastery: number
}

interface TopicSearchResult {
  location: AtlasLocation
  topic: AtlasTopic
}

interface AtlasGradeCategory {
  grade: AtlasGrade
  label: string
  description: string
  accent: string
  soft: string
  dark: string
}

const atlasGradeCategories: AtlasGradeCategory[] = [
  {
    grade: 1,
    label: '1 клас',
    description: 'Лічба й перші дії',
    accent: '#6da83f',
    soft: '#f0f8e4',
    dark: '#47772b',
  },
  {
    grade: 2,
    label: '2 клас',
    description: 'Розряди й множення',
    accent: '#33a4a0',
    soft: '#e3f7f6',
    dark: '#21736f',
  },
  {
    grade: 3,
    label: '3 клас',
    description: 'Письмові обчислення',
    accent: '#347fbe',
    soft: '#e7f2fb',
    dark: '#245b8b',
  },
  {
    grade: 4,
    label: '4 клас',
    description: 'Великі числа й геометрія',
    accent: '#9a67c7',
    soft: '#f2eafa',
    dark: '#684493',
  },
  {
    grade: 5,
    label: '5 клас',
    description: 'Математичні основи',
    accent: '#3e9b83',
    soft: '#e4f7f1',
    dark: '#246d5b',
  },
  {
    grade: 6,
    label: '6 клас',
    description: 'Дроби й відношення',
    accent: '#5579cf',
    soft: '#eaf0ff',
    dark: '#3855a1',
  },
  {
    grade: 7,
    label: '7 клас',
    description: 'Алгебра й доведення',
    accent: '#8a63c7',
    soft: '#f1eafc',
    dark: '#614198',
  },
  {
    grade: 8,
    label: '8 клас',
    description: 'Функції та геометрія',
    accent: '#d77843',
    soft: '#fff0e7',
    dark: '#a54e24',
  },
  {
    grade: 9,
    label: '9 клас',
    description: 'Системи й імовірність',
    accent: '#ca557f',
    soft: '#fdeaf1',
    dark: '#933653',
  },
]

const atlasDefaultGradeStyle: Record<string, string> = {
  '--grade-accent': '#da4f88',
  '--grade-soft': '#fff1f7',
  '--grade-dark': '#b83e72',
}

const router = useRouter()
const profileStore = useProfileStore()
const firstAtlasLocation = atlasLocations[0]!
const topicGradesById = new Map(
  curriculumTopics.map((topic) => [topic.id, topic.gradeLevels] as const),
)
const progress = ref<TopicProgress[]>([])
const selectedTopic = ref<CurriculumTopic>()
const selectedAtlasTopic = ref<AtlasTopic>()
const selectedLocationId = ref(firstAtlasLocation.id)
const selectedGrade = ref<AtlasGradeFilter>('all')
const searchQuery = ref('')
const locationPanel = ref<HTMLElement>()
const errorMessage = ref('')
const topicDialog = ref<HTMLElement>()
useDialogFocus(
  computed(() => Boolean(selectedTopic.value)),
  topicDialog,
  () => {
    selectedTopic.value = undefined
  },
)

const progressMap = computed(() => new Map(progress.value.map((entry) => [entry.topicId, entry])))
const recommendation = computed(() => recommendNextTopic(curriculumTopics, progress.value))
const visibleLocations = computed(() =>
  selectedGrade.value === 'all'
    ? atlasLocations
    : atlasLocations.filter((location) =>
        location.topics.some((topic) => topicMatchesGrade(topic, selectedGrade.value)),
      ),
)
const selectedLocation = computed(
  () =>
    visibleLocations.value.find((location) => location.id === selectedLocationId.value) ??
    visibleLocations.value[0] ??
    firstAtlasLocation,
)
const visibleLocationTopics = computed(() =>
  selectedLocation.value.topics.filter((topic) => topicMatchesGrade(topic)),
)
const selectedGradeCategory = computed(() =>
  selectedGrade.value === 'all'
    ? undefined
    : atlasGradeCategories.find((category) => category.grade === selectedGrade.value),
)
const selectedLocationPosition = computed(
  () =>
    visibleLocations.value.findIndex((location) => location.id === selectedLocation.value.id) + 1,
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
        .filter((topic) => {
          const liveTopic = topic.liveTopicId ? findTopic(topic.liveTopicId) : undefined
          if (!topicMatchesGrade(topic)) return false
          const searchText = [
            topic.title,
            ...(liveTopic?.tags ?? []),
            ...(liveTopic?.gradeLevels.map((grade) => `${grade} клас`) ?? []),
          ]
            .join(' ')
            .toLocaleLowerCase('uk')
          return searchText.includes(query)
        })
        .map((topic) => ({ location, topic })),
    )
    .slice(0, 80)
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

const gradeContextStyle = computed<Record<string, string>>(() => {
  const category = selectedGradeCategory.value
  return category ? gradeStyle(category.grade) : atlasDefaultGradeStyle
})

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  try {
    if (profileId) progress.value = await learningRepository.listTopicProgress(profileId)
  } catch {
    errorMessage.value = 'Не вдалося прочитати прогрес карти. Теми все одно можна переглядати.'
  }

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

function gradeStyle(grade: AtlasGrade): Record<string, string> {
  const category = atlasGradeCategories.find((entry) => entry.grade === grade)
  return {
    '--grade-accent': category?.accent ?? '#da4f88',
    '--grade-soft': category?.soft ?? '#fff1f7',
    '--grade-dark': category?.dark ?? '#b83e72',
  }
}

function topicGradeLevels(topic: AtlasTopic): AtlasGrade[] {
  const grades: SchoolGrade[] = topic.liveTopicId
    ? (topicGradesById.get(topic.liveTopicId) ?? [])
    : []

  return grades.filter((grade): grade is AtlasGrade => grade >= 1 && grade <= 9)
}

function topicMatchesGrade(
  topic: AtlasTopic,
  grade: AtlasGradeFilter = selectedGrade.value,
): boolean {
  return grade === 'all' || topicGradeLevels(topic).includes(grade)
}

function topicGradeStyle(topic: AtlasTopic): Record<string, string> {
  const grades = topicGradeLevels(topic)
  const highlightedGrade =
    selectedGrade.value !== 'all' && grades.includes(selectedGrade.value)
      ? selectedGrade.value
      : grades[0]

  return highlightedGrade ? gradeStyle(highlightedGrade as AtlasGrade) : {}
}

function locationGradeLevels(location: AtlasLocation): AtlasGrade[] {
  const grades = new Set(location.topics.flatMap((topic) => topicGradeLevels(topic)))
  return atlasGradeCategories.map((category) => category.grade).filter((grade) => grades.has(grade))
}

function gradeTopicCount(grade: AtlasGrade): number {
  return curriculumTopics.filter((topic) => topic.gradeLevels.includes(grade)).length
}

function filteredLocationTopics(location: AtlasLocation): AtlasTopic[] {
  return location.topics.filter((topic) => topicMatchesGrade(topic))
}

function locationRange(location: AtlasLocation): string {
  const topics = filteredLocationTopics(location)
  const first = topics[0]?.order ?? 0
  const last = topics.at(-1)?.order ?? first
  return `${first}–${last}`
}

function liveLessonCount(location: AtlasLocation): number {
  return filteredLocationTopics(location).filter((topic) => topic.liveTopicId).length
}

function masteredCount(location: AtlasLocation): number {
  return filteredLocationTopics(location).filter(
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

function selectGrade(grade: AtlasGradeFilter): void {
  selectedGrade.value = grade
  selectedAtlasTopic.value = undefined
  selectedTopic.value = undefined

  const currentLocation = atlasLocations.find(
    (location) => location.id === selectedLocationId.value,
  )

  if (
    grade !== 'all' &&
    !currentLocation?.topics.some((topic) => topicMatchesGrade(topic, grade))
  ) {
    selectedLocationId.value =
      atlasLocations.find((location) =>
        location.topics.some((topic) => topicMatchesGrade(topic, grade)),
      )?.id ?? firstAtlasLocation.id
  }
}

function stepLocation(direction: -1 | 1): void {
  const currentIndex = visibleLocations.value.findIndex(
    (location) => location.id === selectedLocation.value.id,
  )
  const nextIndex = Math.min(
    visibleLocations.value.length - 1,
    Math.max(0, currentIndex + direction),
  )
  selectLocation(visibleLocations.value[nextIndex]!, false)
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
  openAtlasTopic(result.topic)
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
  <section class="atlas-page page-shell" :style="gradeContextStyle">
    <p v-if="errorMessage" class="inline-error" role="alert">{{ errorMessage }}</p>
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

    <section class="atlas-grade-map" aria-labelledby="atlas-grade-map-title">
      <header class="atlas-grade-map__heading">
        <div>
          <span class="eyebrow">Кольорові маршрути</span>
          <h2 id="atlas-grade-map-title">Теми за класами</h2>
        </div>
        <p>Обери клас — атлас покаже його теми та локації. Кожен маршрут має свій колір.</p>
      </header>

      <div class="atlas-grade-tabs" role="group" aria-label="Фільтр тем за класом">
        <button
          type="button"
          :style="atlasDefaultGradeStyle"
          :class="{ 'atlas-grade-tab--selected': selectedGrade === 'all' }"
          :aria-pressed="selectedGrade === 'all'"
          @click="selectGrade('all')"
        >
          <span class="atlas-grade-tab__seal"><AppIcon name="map" /></span>
          <span class="atlas-grade-tab__copy">
            <strong>Весь атлас</strong>
            <small>{{ atlasTopicCount }} зупинок</small>
          </span>
        </button>

        <button
          v-for="category in atlasGradeCategories"
          :key="category.grade"
          type="button"
          :style="gradeStyle(category.grade)"
          :class="{ 'atlas-grade-tab--selected': selectedGrade === category.grade }"
          :aria-pressed="selectedGrade === category.grade"
          @click="selectGrade(category.grade)"
        >
          <span class="atlas-grade-tab__seal">{{ category.grade }}</span>
          <span class="atlas-grade-tab__copy">
            <strong>{{ category.label }}</strong>
            <small>{{ category.description }}</small>
          </span>
          <em>{{ gradeTopicCount(category.grade) }} тем</em>
        </button>
      </div>
    </section>

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
        <strong>{{
          selectedGrade === 'all' ? 'Обери локацію експедиції' : `Локації ${selectedGrade} класу`
        }}</strong>
        <span><AppIcon name="sparkles" /></span>
      </div>

      <div
        :class="['atlas-world-route', { 'atlas-world-route--filtered': selectedGrade !== 'all' }]"
        aria-label="Локації математичного світу"
      >
        <article
          v-for="location in visibleLocations"
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
              <span class="atlas-location-card__grades">
                <i
                  v-for="grade in locationGradeLevels(location)"
                  :key="grade"
                  :style="gradeStyle(grade)"
                  :class="{ 'is-highlighted': selectedGrade === grade }"
                >
                  {{ grade }} клас
                </i>
                <i v-if="locationGradeLevels(location).length === 0" class="is-future">
                  майбутній маршрут
                </i>
              </span>
            </span>
            <span class="atlas-location-card__meta">
              <em>{{ filteredLocationTopics(location).length }} зупинок</em>
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
            >Локація {{ selectedLocationPosition }} із {{ visibleLocations.length }}</span
          >
          <h2>{{ selectedLocation.name }}</h2>
          <p>{{ selectedLocation.description }}</p>
          <div>
            <span><AppIcon name="map" /> {{ visibleLocationTopics.length }} зупинок</span>
            <span><AppIcon name="star" /> {{ selectedLocation.landmark }}</span>
            <span
              v-for="grade in locationGradeLevels(selectedLocation)"
              :key="grade"
              class="atlas-location-hero__grade"
              :style="gradeStyle(grade)"
            >
              {{ grade }} клас
            </span>
          </div>
        </div>

        <div class="atlas-location-hero__nav">
          <button
            type="button"
            aria-label="Попередня локація"
            :disabled="selectedLocationPosition === 1"
            @click="stepLocation(-1)"
          >
            ←
          </button>
          <span>{{ selectedLocationPosition }} / {{ visibleLocations.length }}</span>
          <button
            type="button"
            aria-label="Наступна локація"
            :disabled="selectedLocationPosition === visibleLocations.length"
            @click="stepLocation(1)"
          >
            →
          </button>
        </div>
      </header>

      <div class="atlas-trail-heading">
        <div>
          <span class="eyebrow">
            {{
              selectedGrade === 'all'
                ? 'Стежка знань'
                : `${selectedGrade} клас · кольоровий маршрут`
            }}
          </span>
          <h3>
            {{
              selectedGrade === 'all'
                ? 'Зупинки цієї локації'
                : `Теми ${selectedGrade} класу в цій локації`
            }}
          </h3>
        </div>
        <p v-if="selectedGrade === 'all'">
          Кожна зупинка відкриває наступну ідею, а корона завершує цілий розділ.
        </p>
        <p v-else>
          Показано {{ visibleLocationTopics.length }} тем. Кольоровий бейдж підказує клас.
        </p>
      </div>

      <ol class="atlas-topic-trail">
        <li
          v-for="topic in visibleLocationTopics"
          :key="topic.id"
          :style="topicGradeStyle(topic)"
          :class="[
            `atlas-topic-stop--${atlasTopicStatus(topic)}`,
            {
              'atlas-topic-stop--boss': topic.isBoss,
              'atlas-topic-stop--selected': topic.id === selectedAtlasTopic?.id,
              'atlas-topic-stop--graded': topicGradeLevels(topic).length > 0,
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
              <span v-if="topicGradeLevels(topic).length" class="atlas-topic-stop__grades">
                <i v-for="grade in topicGradeLevels(topic)" :key="grade" :style="gradeStyle(grade)">
                  {{ grade }} клас
                </i>
              </span>
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
        ref="topicDialog"
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
        <section class="topic-modal__outline" aria-label="Зміст теми">
          <strong>У цій темі</strong>
          <ul>
            <li v-for="subtopic in selectedTopic.subtopics" :key="subtopic">
              {{ subtopic }}
            </li>
          </ul>
        </section>
        <ContentTags
          class="topic-modal__tags"
          :tags="selectedTopic.tags"
          :grade-levels="selectedTopic.gradeLevels"
        />

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
            v-if="selectedRoom.status !== 'challenging' || findFullLesson(selectedTopic.id)"
            @click="launchSelected(false)"
          >
            <AppIcon name="play" />
            {{ selectedRoom.status === 'inProgress' ? 'Продовжити урок' : 'Почати урок' }}
          </BaseButton>
          <BaseButton
            v-if="selectedRoom.status === 'challenging'"
            :variant="findFullLesson(selectedTopic.id) ? 'secondary' : 'primary'"
            @click="launchSelected(true)"
          >
            Спробувати 3-хв прев’ю
          </BaseButton>
        </div>
      </aside>
    </div>
  </section>
</template>
