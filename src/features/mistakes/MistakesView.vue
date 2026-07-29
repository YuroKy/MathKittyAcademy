<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { useDialogFocus } from '@/composables/useDialogFocus'
import { curriculumTopics } from '@/content/curriculum/topics'
import { areEquivalentAnswers } from '@/domain/exercises/rational'
import {
  generateSimilarMistakeExercise,
  type SimilarMistakeExercise,
} from '@/domain/exercises/similarMistake'
import {
  mistakeRepository,
  type MistakeDetails,
} from '@/infrastructure/repositories/mistakeRepository'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { ErrorType } from '@/types/domain'

const profileStore = useProfileStore()
const items = ref<MistakeDetails[]>([])
const stateFilter = ref<'all' | 'open' | 'resolved'>('open')
const typeFilter = ref<'all' | ErrorType>('all')
const selected = ref<MistakeDetails>()
const retryAnswer = ref('')
const retryFeedback = ref('')
const similarExercise = ref<SimilarMistakeExercise>()
const loading = ref(true)
const retryDialog = ref<HTMLElement>()
useDialogFocus(
  computed(() => Boolean(selected.value)),
  retryDialog,
  () => {
    selected.value = undefined
  },
)

const labels: Record<ErrorType, string> = {
  conceptMisunderstanding: 'Ідея теми',
  calculationError: 'Обчислення',
  signError: 'Знак',
  operationOrderError: 'Порядок дій',
  fractionRuleError: 'Правило дробів',
  conditionMisread: 'Умова',
  inputMistake: 'Введення',
  unknown: 'Потрібно дослідити',
}
const explanations: Record<ErrorType, string> = {
  conceptMisunderstanding: 'Схоже, правило теми ще потребує іншого пояснення.',
  calculationError: 'Ідея правильна, але один з обчислювальних кроків збився.',
  signError: 'Перевір, як змінюються знаки під час цієї дії.',
  operationOrderError: 'Звір порядок: дужки, степені, множення або ділення, потім додавання.',
  fractionRuleError: 'Перевір окремо чисельники, знаменники та правило дії з дробами.',
  conditionMisread: 'Повернися до того, що саме потрібно знайти в умові.',
  inputMistake: 'Математичний крок схожий на правильний, але формат відповіді відрізняється.',
  unknown: 'Однозначної причини не видно — схожа вправа допоможе її знайти.',
}

const filtered = computed(() =>
  items.value.filter(({ mistake }) => {
    const stateMatches =
      stateFilter.value === 'all' ||
      (stateFilter.value === 'resolved' ? mistake.resolved : !mistake.resolved)
    return stateMatches && (typeFilter.value === 'all' || mistake.errorType === typeFilter.value)
  }),
)

onMounted(load)

async function load(): Promise<void> {
  const profileId = profileStore.activeProfile?.id
  if (!profileId) return
  try {
    items.value = await mistakeRepository.list(profileId)
  } finally {
    loading.value = false
  }
}

async function checkRetry(): Promise<void> {
  const profileId = profileStore.activeProfile?.id
  const generated = similarExercise.value
  const expected = generated?.expectedAnswer
  if (!profileId || !selected.value || !generated || !expected || !retryAnswer.value.trim()) return
  if (!areEquivalentAnswers(retryAnswer.value, expected)) {
    retryFeedback.value = 'Ще не збіглося. Переглянь правильну відповідь і спробуй знову.'
    return
  }
  const source = selected.value.attempt
  if (!source) return
  const resolvedAttempt = await learningRepository.recordAttempt({
    profileId,
    sessionId: source.sessionId,
    exerciseId: `${source.exerciseId}:retry:${selected.value.mistake.id}`,
    templateId: source.templateId,
    seed: generated.seed,
    topicId: source.topicId ?? selected.value.mistake.topicId,
    skillIds: source.skillIds,
    prompt: generated.prompt,
    expectedAnswer: expected,
    submittedAnswer: retryAnswer.value,
    normalizedAnswer: retryAnswer.value.trim().replace(',', '.'),
    isCorrect: true,
    hintLevelUsed: 0,
  })
  await mistakeRepository.resolve(profileId, selected.value.mistake.id, resolvedAttempt.id)
  retryFeedback.value = 'Розплутано! Помилку позначено виправленою.'
  await load()
}

function openRetry(item: MistakeDetails): void {
  if (!item.attempt) return
  const generated = generateSimilarMistakeExercise(item.attempt)
  if (!generated) {
    retryFeedback.value = 'Для цієї старої вправи не вдалося безпечно створити новий приклад.'
    return
  }
  selected.value = item
  similarExercise.value = generated
  retryAnswer.value = ''
  retryFeedback.value = ''
}

function topicTitle(topicId: string): string {
  return curriculumTopics.find((topic) => topic.id === topicId)?.title ?? topicId
}
</script>

<template>
  <section class="mistakes-page page-shell">
    <header class="page-heading">
      <span class="eyebrow">Без сорому за помилки</span>
      <h1>Заплутані клубочки</h1>
      <p>Тут зібрані кроки, до яких корисно повернутися.</p>
    </header>
    <div class="filter-row">
      <select v-model="stateFilter" aria-label="Стан помилки">
        <option value="open">Ще заплутані</option>
        <option value="resolved">Розплутані</option>
        <option value="all">Усі</option>
      </select>
      <select v-model="typeFilter" aria-label="Тип помилки">
        <option value="all">Усі типи</option>
        <option v-for="(label, value) in labels" :key="value" :value="value">{{ label }}</option>
      </select>
    </div>
    <div v-if="loading" class="loading-state" role="status">Збираємо клубочки…</div>
    <div v-else-if="!filtered.length" class="question-block question-block--center">
      <MascotCard mood="celebrating" message="Тут поки все розплутано." compact />
      <h2>Немає помилок за цим фільтром</h2>
    </div>
    <div v-else class="mistake-list">
      <article v-for="item in filtered" :key="item.mistake.id" class="settings-card">
        <span class="eyebrow">{{ labels[item.mistake.errorType] }}</span>
        <h2>{{ topicTitle(item.mistake.topicId) }}</h2>
        <p>{{ item.attempt?.prompt ?? 'Умову старої вправи не вдалося відновити.' }}</p>
        <p>{{ explanations[item.mistake.errorType] }}</p>
        <dl>
          <dt>Твоя відповідь</dt><dd>{{ item.attempt?.submittedAnswer }}</dd>
          <dt>Правильна відповідь</dt><dd>{{ item.attempt?.expectedAnswer ?? '—' }}</dd>
        </dl>
        <small>{{ new Date(item.mistake.createdAt).toLocaleString('uk-UA') }}</small>
        <BaseButton v-if="!item.mistake.resolved && item.attempt?.expectedAnswer" @click="openRetry(item)">
          Спробувати схоже завдання
        </BaseButton>
      </article>
    </div>
    <div v-if="selected" class="collection-modal-backdrop" @click.self="selected = undefined">
      <aside ref="retryDialog" class="collection-modal" role="dialog" aria-modal="true" aria-labelledby="retry-title">
        <button class="icon-button collection-modal__close" aria-label="Закрити" @click="selected = undefined">×</button>
        <h2 id="retry-title">Розплутай крок</h2>
        <p>{{ similarExercise?.prompt }}</p>
        <input v-model="retryAnswer" inputmode="decimal" aria-label="Нова відповідь" />
        <p v-if="retryFeedback" aria-live="polite">{{ retryFeedback }}</p>
        <BaseButton @click="checkRetry">Перевірити</BaseButton>
      </aside>
    </div>
  </section>
</template>
