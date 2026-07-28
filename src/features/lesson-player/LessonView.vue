<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import ContentTags from '@/components/learning/ContentTags.vue'
import FractionBar from '@/components/learning/FractionBar.vue'
import GroupingBoard from '@/components/learning/GroupingBoard.vue'
import GuidedStepBuilder from '@/components/learning/GuidedStepBuilder.vue'
import PredictionChoice from '@/components/learning/PredictionChoice.vue'
import TapReveal from '@/components/learning/TapReveal.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { findTopic } from '@/content/curriculum/topics'
import { findGrade5Lesson } from '@/content/lessons/grade5Lessons'
import { findTopicPreview } from '@/content/lessons/topicPreviews'
import { buildLessonExerciseSet } from '@/domain/exercises/generator'
import { areEquivalentAnswers } from '@/domain/exercises/rational'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { ExerciseInstance, LearningSession } from '@/types/domain'

type LessonStage =
  'introduction' | 'prediction' | 'explore' | 'guided-example' | 'practice' | 'summary'

interface InteractionState extends Record<string, unknown> {
  predictionIndex?: number
  groupCounts: number[]
  fractionParts: number[]
  guidedStepCount: number
  revealIndexes: number[]
}

const fullStageOrder: LessonStage[] = [
  'introduction',
  'prediction',
  'explore',
  'guided-example',
  'practice',
  'summary',
]
const previewStageOrder: LessonStage[] = ['introduction', 'prediction', 'explore', 'summary']

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const topic = computed(() => findTopic(String(route.params.topicId)))
const preview = computed(() => findTopicPreview(String(route.params.topicId)))
const fullLesson = computed(() => findGrade5Lesson(String(route.params.topicId)))
const requestedPreview = computed(() => route.query.mode === 'preview')
const previewOnly = computed(() => requestedPreview.value || !fullLesson.value)
const stageOrder = computed(() => (previewOnly.value ? previewStageOrder : fullStageOrder))

const session = ref<LearningSession>()
const stage = ref<LessonStage>('introduction')
const exercises = ref<ExerciseInstance[]>([])
const exerciseIndex = ref(0)
const answer = ref('')
const hintLevel = ref(0)
const feedback = ref<'correct' | 'incorrect' | 'revealed' | ''>('')
const saving = ref(false)
const loading = ref(true)
const errorMessage = ref('')

const predictionIndex = ref<number>()
const groupCounts = ref([0, 0, 0])
const fractionParts = ref<number[]>([])
const guidedStepCount = ref(0)
const revealIndexes = ref<number[]>([])

const currentExercise = computed(() => exercises.value[exerciseIndex.value])
const stageIndex = computed(() => Math.max(0, stageOrder.value.indexOf(stage.value)))
const overallProgress = computed(() => {
  if (stage.value === 'practice') {
    const practiceSlice = exerciseIndex.value / Math.max(exercises.value.length, 1)
    return ((stageIndex.value + practiceSlice) / (stageOrder.value.length - 1)) * 100
  }
  return (stageIndex.value / Math.max(stageOrder.value.length - 1, 1)) * 100
})
const visibleHints = computed(() => currentExercise.value?.hints.slice(0, hintLevel.value) ?? [])
const interactionComplete = computed(() => {
  if (!fullLesson.value) return revealIndexes.value.length === genericRevealItems.value.length
  if (fullLesson.value.interactionKind === 'groupingBoard') {
    return groupCounts.value.reduce((sum, count) => sum + count, 0) === 12
  }
  if (fullLesson.value.interactionKind === 'fractionBar') return fractionParts.value.length === 3
  return revealIndexes.value.length === fullLesson.value.explorationItems.length
})
const canContinue = computed(() => {
  if (stage.value === 'prediction') return predictionIndex.value !== undefined
  if (stage.value === 'explore') return interactionComplete.value
  if (stage.value === 'guided-example') {
    return guidedStepCount.value === (fullLesson.value?.guidedSteps.length ?? 0)
  }
  return stage.value !== 'practice'
})
const genericRevealItems = computed(() => [
  {
    label: 'Головна ідея',
    content: preview.value?.hook ?? 'Подивися на математичну ідею з іншого боку.',
  },
  {
    label: 'Як перевірити',
    content: preview.value?.explanation ?? 'Перевір результат конкретним прикладом.',
  },
  {
    label: 'Твій виклик',
    content: preview.value?.challengeLabel ?? 'Спробуй коротку вправу.',
  },
])
const explorationItems = computed(
  () => fullLesson.value?.explorationItems ?? genericRevealItems.value,
)
const explorationTitle = computed(
  () => fullLesson.value?.explorationTitle ?? 'Відкрий три підказки теми',
)

onMounted(initializeLesson)

async function initializeLesson(): Promise<void> {
  if (!topic.value || !preview.value) {
    loading.value = false
    return
  }

  if (!previewOnly.value) {
    await initializeFullSession()
  }
  loading.value = false
}

async function initializeFullSession(reset = false): Promise<void> {
  const profileId = profileStore.activeProfile?.id
  if (!profileId || !topic.value || !fullLesson.value) return

  try {
    session.value = await learningRepository.startLesson(profileId, topic.value.id)
    exercises.value = buildLessonExerciseSet(fullLesson.value, session.value.id)

    if (!reset) {
      stage.value = isLessonStage(session.value.currentStage)
        ? session.value.currentStage
        : 'introduction'
      exerciseIndex.value = Math.min(
        session.value.currentExerciseIndex ?? 0,
        exercises.value.length - 1,
      )
      restoreInteractionState(session.value.interactionState)
    }

    const seeds = exercises.value.map((exercise) => exercise.seed)
    await savePosition(stage.value, exerciseIndex.value, seeds)
  } catch (error) {
    console.error('Failed to start lesson', error)
    errorMessage.value = 'Не вдалося відкрити урок. Завершений прогрес у безпеці — спробуй ще раз.'
  }
}

function restoreInteractionState(saved: Record<string, unknown> | undefined): void {
  if (!saved) return
  if (typeof saved.predictionIndex === 'number') predictionIndex.value = saved.predictionIndex
  if (isNumberArray(saved.groupCounts)) groupCounts.value = saved.groupCounts
  if (isNumberArray(saved.fractionParts)) fractionParts.value = saved.fractionParts
  if (typeof saved.guidedStepCount === 'number') guidedStepCount.value = saved.guidedStepCount
  if (isNumberArray(saved.revealIndexes)) revealIndexes.value = saved.revealIndexes
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'number')
}

function isLessonStage(value: string | undefined): value is LessonStage {
  return value !== undefined && fullStageOrder.includes(value as LessonStage)
}

function serializeInteractionState(): InteractionState {
  return {
    ...(predictionIndex.value !== undefined ? { predictionIndex: predictionIndex.value } : {}),
    groupCounts: [...groupCounts.value],
    fractionParts: [...fractionParts.value],
    guidedStepCount: guidedStepCount.value,
    revealIndexes: [...revealIndexes.value],
  }
}

async function savePosition(
  nextStage = stage.value,
  nextIndex = exerciseIndex.value,
  seeds = exercises.value.map((exercise) => exercise.seed),
): Promise<void> {
  if (!session.value) return
  await learningRepository.saveLessonPosition(
    session.value.id,
    nextStage,
    nextIndex,
    seeds,
    serializeInteractionState(),
  )
}

async function continueLesson(): Promise<void> {
  if (!canContinue.value) return
  const next = stageOrder.value[stageIndex.value + 1]
  if (!next) return
  stage.value = next
  await savePosition(next)
}

async function updatePrediction(index: number): Promise<void> {
  predictionIndex.value = index
  await savePosition()
}

async function updateGroupCounts(value: number[]): Promise<void> {
  groupCounts.value = value
  await savePosition()
}

async function updateFractionParts(value: number[]): Promise<void> {
  fractionParts.value = value
  await savePosition()
}

async function updateGuidedSteps(value: number): Promise<void> {
  guidedStepCount.value = value
  await savePosition()
}

function updateRevealIndexes(value: number[]): void {
  revealIndexes.value = value
}

async function startFullLesson(): Promise<void> {
  if (!fullLesson.value) return
  await router.replace({ path: route.path })
  resetInteractiveState()
  stage.value = 'introduction'
  loading.value = true
  await initializeFullSession(true)
  loading.value = false
}

function resetInteractiveState(): void {
  predictionIndex.value = undefined
  groupCounts.value = [0, 0, 0]
  fractionParts.value = []
  guidedStepCount.value = 0
  revealIndexes.value = []
  exerciseIndex.value = 0
  answer.value = ''
  feedback.value = ''
  hintLevel.value = 0
}

async function submitAnswer(): Promise<void> {
  const exercise = currentExercise.value
  const activeSession = session.value
  const profileId = profileStore.activeProfile?.id
  if (!exercise || !activeSession || !profileId || answer.value.trim() === '' || saving.value)
    return

  saving.value = true
  try {
    const isCorrect = areEquivalentAnswers(answer.value, exercise.expectedAnswer)
    await learningRepository.recordAttempt({
      profileId,
      sessionId: activeSession.id,
      exerciseId: exercise.id,
      templateId: exercise.templateId,
      seed: exercise.seed,
      skillIds: exercise.skillIds,
      submittedAnswer: answer.value,
      normalizedAnswer: answer.value.trim().replace(',', '.'),
      isCorrect,
      hintLevelUsed: hintLevel.value,
    })
    feedback.value = isCorrect ? 'correct' : 'incorrect'
  } catch (error) {
    console.error('Failed to save attempt', error)
    errorMessage.value = 'Відповідь не збереглася. Не переходь далі — спробуй ще раз.'
  } finally {
    saving.value = false
  }
}

function showHint(): void {
  hintLevel.value = Math.min(hintLevel.value + 1, currentExercise.value?.hints.length ?? 0)
}

async function revealAnswer(): Promise<void> {
  const exercise = currentExercise.value
  const activeSession = session.value
  const profileId = profileStore.activeProfile?.id
  if (!exercise || !activeSession || !profileId || saving.value) return

  saving.value = true
  try {
    await learningRepository.recordAttempt({
      profileId,
      sessionId: activeSession.id,
      exerciseId: exercise.id,
      templateId: exercise.templateId,
      seed: exercise.seed,
      skillIds: exercise.skillIds,
      submittedAnswer: 'Не знаю',
      normalizedAnswer: '',
      isCorrect: false,
      hintLevelUsed: Math.max(hintLevel.value, 2),
    })
    feedback.value = 'revealed'
  } catch (error) {
    console.error('Failed to save unknown answer', error)
    errorMessage.value = 'Не вдалося зберегти цю спробу. Спробуй іще раз.'
  } finally {
    saving.value = false
  }
}

async function nextExercise(): Promise<void> {
  if (saving.value || (feedback.value !== 'correct' && feedback.value !== 'revealed')) return

  if (exerciseIndex.value < exercises.value.length - 1) {
    exerciseIndex.value += 1
    answer.value = ''
    hintLevel.value = 0
    feedback.value = ''
    await savePosition('practice', exerciseIndex.value)
    return
  }

  if (!session.value) return
  saving.value = true
  try {
    await learningRepository.completeLesson(session.value)
    stage.value = 'summary'
    session.value.status = 'completed'
    session.value.earnedXp = 40
  } catch (error) {
    console.error('Failed to complete lesson', error)
    errorMessage.value = 'Урок завершено, але підсумок не зберігся. Спробуй ще раз.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="lesson-page">
    <header class="lesson-header">
      <button
        class="icon-button"
        type="button"
        aria-label="Вийти з уроку"
        @click="router.push('/map')"
      >
        ×
      </button>
      <div>
        <span>
          {{ topic?.title ?? 'Урок' }}
          <small v-if="previewOnly">· коротке прев’ю</small>
        </span>
        <ContentTags
          class="lesson-header__tags"
          :tags="topic?.tags ?? []"
          :grade-levels="topic?.gradeLevels ?? []"
          compact
        />
        <ProgressBar :value="overallProgress" label="Прогрес уроку" />
      </div>
      <span class="lesson-time">≈ {{ previewOnly ? 3 : (topic?.estimatedMinutes ?? 10) }} хв</span>
    </header>

    <div v-if="loading" class="loading-state" role="status">Мурка готує інтерактиви…</div>

    <div v-else-if="errorMessage && !session && !previewOnly" class="lesson-error" role="alert">
      <MascotCard mood="mistake" :message="errorMessage" />
      <BaseButton @click="router.push('/map')">Повернутися на карту</BaseButton>
    </div>

    <div v-else-if="!topic || !preview" class="lesson-error">
      <MascotCard mood="thinking" message="Не знайшла цю тему на карті академії." />
      <BaseButton @click="router.push('/map')">Відкрити карту</BaseButton>
    </div>

    <article v-else class="lesson-card lesson-card--interactive">
      <template v-if="stage === 'introduction'">
        <MascotCard
          mood="explaining"
          :message="
            fullLesson?.mascotMessage ?? 'За три хвилини торкнемося головної ідеї цієї теми.'
          "
        />
        <div class="lesson-copy">
          <span class="eyebrow">{{ previewOnly ? 'Вільна спроба' : 'Крок 1 · Старт' }}</span>
          <h1>{{ fullLesson?.introTitle ?? topic.title }}</h1>
          <p>{{ fullLesson?.introText ?? preview.hook }}</p>
          <div class="lesson-promise">
            <span aria-hidden="true">✦</span>
            <p>Тут не буде довгого вступу: спочатку твоя гіпотеза, потім — взаємодія.</p>
          </div>
        </div>
      </template>

      <PredictionChoice
        v-else-if="stage === 'prediction'"
        :question="preview.question"
        :choices="preview.choices"
        :correct-choice-index="preview.correctChoiceIndex"
        :selected-index="predictionIndex"
        @update:selected-index="updatePrediction"
      >
        <template #explanation>{{ preview.explanation }}</template>
      </PredictionChoice>

      <template v-else-if="stage === 'explore'">
        <GroupingBoard
          v-if="fullLesson?.interactionKind === 'groupingBoard'"
          :model-value="groupCounts"
          @update:model-value="updateGroupCounts"
        />
        <FractionBar
          v-else-if="fullLesson?.interactionKind === 'fractionBar'"
          :model-value="fractionParts"
          @update:model-value="updateFractionParts"
        />
        <TapReveal
          v-else
          :items="explorationItems"
          :title="explorationTitle"
          :model-value="revealIndexes"
          @update:model-value="updateRevealIndexes"
        />
      </template>

      <GuidedStepBuilder
        v-else-if="stage === 'guided-example' && fullLesson"
        :title="fullLesson.guidedTitle"
        :steps="fullLesson.guidedSteps"
        :revealed-count="guidedStepCount"
        @update:revealed-count="updateGuidedSteps"
      />

      <template v-else-if="stage === 'practice' && currentExercise">
        <div class="exercise-shell">
          <div class="exercise-meta">
            <span class="eyebrow"
              >Твоя спроба · {{ exerciseIndex + 1 }}/{{ exercises.length }}</span
            >
            <span class="difficulty-pill">інтерактивна основа</span>
          </div>
          <h1>{{ currentExercise.title ?? 'Виконай вправу' }}</h1>
          <p class="exercise-question">{{ currentExercise.prompt }}</p>

          <form class="answer-form" @submit.prevent="submitAnswer">
            <label class="field">
              <span>Твоя відповідь</span>
              <input
                v-model="answer"
                :inputmode="currentExercise.kind === 'fractionInput' ? 'text' : 'numeric'"
                autocomplete="off"
                :placeholder="
                  currentExercise.kind === 'fractionInput' ? 'Наприклад, 3/6' : 'Введи число'
                "
                :aria-invalid="feedback === 'incorrect'"
                :disabled="feedback === 'correct' || feedback === 'revealed'"
                autofocus
              />
            </label>
            <BaseButton
              v-if="feedback !== 'correct' && feedback !== 'revealed'"
              type="submit"
              :disabled="answer.trim() === '' || saving"
            >
              Перевірити
            </BaseButton>
          </form>

          <div class="exercise-tools">
            <button type="button" @click="showHint">
              <span aria-hidden="true">✦</span> Підказка
            </button>
            <button type="button" @click="revealAnswer">Не знаю</button>
          </div>

          <div v-if="visibleHints.length" class="hint-panel">
            <strong>Підказка {{ hintLevel }}</strong>
            <p v-for="hint in visibleHints" :key="hint">{{ hint }}</p>
          </div>

          <div class="feedback-region" aria-live="polite">
            <div v-if="feedback === 'correct'" class="feedback feedback--correct">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Так, це працює!</strong>
                <p>{{ currentExercise.solutionSteps[0] }}</p>
              </div>
            </div>
            <div v-else-if="feedback === 'incorrect'" class="feedback feedback--incorrect">
              <span aria-hidden="true">↻</span>
              <div>
                <strong>Розплутаємо цей крок</strong>
                <p>Відкрий підказку або зміни відповідь — цю вправу можна виправити.</p>
              </div>
            </div>
            <div v-else-if="feedback === 'revealed'" class="feedback feedback--revealed">
              <span aria-hidden="true">✦</span>
              <div>
                <strong>Ось повне рішення</strong>
                <p v-for="solutionStep in currentExercise.solutionSteps" :key="solutionStep">
                  {{ solutionStep }}
                </p>
              </div>
            </div>
          </div>

          <BaseButton
            v-if="feedback === 'correct' || feedback === 'revealed'"
            :disabled="saving"
            @click="nextExercise"
          >
            {{ exerciseIndex === exercises.length - 1 ? 'Завершити заняття' : 'Наступна вправа' }}
          </BaseButton>
        </div>
      </template>

      <template v-else-if="stage === 'summary'">
        <MascotCard
          :mood="previewOnly ? 'encouraging' : 'celebrating'"
          :message="
            previewOnly
              ? 'Ти вже торкнулася цієї теми. Тепер можна продовжити або дослідити іншу.'
              : 'Готово! Ти сама побудувала ідею, склала кроки й перевірила її вправами.'
          "
        />
        <div class="lesson-copy lesson-copy--center">
          <span class="eyebrow">{{ previewOnly ? 'Прев’ю завершено' : 'Заняття завершено' }}</span>
          <h1>{{ previewOnly ? 'Ідею спробовано' : 'Ще один надійний крок' }}</h1>
          <p>
            {{ previewOnly ? preview.explanation : fullLesson?.summaryText }}
          </p>
          <div v-if="!previewOnly" class="reward-row">
            <span><strong>+40</strong> XP</span>
            <span><strong>3</strong> взаємодії</span>
            <span><strong>↻</strong> повторення</span>
          </div>
          <div v-else-if="!fullLesson" class="preview-coming-soon">
            Повний інтерактивний урок для цієї теми буде наступним контентним оновленням. Прев’ю вже
            доступне без жодних передумов.
          </div>
        </div>
      </template>

      <p v-if="errorMessage && session" class="inline-error" role="alert">{{ errorMessage }}</p>

      <footer v-if="stage !== 'practice'" class="lesson-actions lesson-actions--stackable">
        <template v-if="stage === 'summary'">
          <BaseButton v-if="previewOnly && fullLesson" @click="startFullLesson">
            Продовжити повний урок
          </BaseButton>
          <BaseButton variant="secondary" @click="router.push('/map')">
            Обрати іншу тему
          </BaseButton>
        </template>
        <BaseButton v-else :disabled="!canContinue" @click="continueLesson">
          {{
            !canContinue && stage === 'prediction'
              ? 'Спочатку обери відповідь'
              : !canContinue
                ? 'Заверши взаємодію'
                : 'Продовжити'
          }}
          <span v-if="canContinue" aria-hidden="true">→</span>
        </BaseButton>
      </footer>
    </article>
  </section>
</template>
