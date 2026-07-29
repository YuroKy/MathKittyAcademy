<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import ExerciseRenderer from '@/components/exercises/ExerciseRenderer.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { useActivityTracker } from '@/composables/useActivityTracker'
import { useExerciseSubmission } from '@/composables/useExerciseSubmission'
import { isAnswerEmpty } from '@/domain/exercises/validateAnswer'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { reviewRepository } from '@/infrastructure/repositories/reviewRepository'
import { useProfileStore } from '@/stores/profile'
import type { ExerciseAnswer, ExerciseInstance, LearningSession } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()
useActivityTracker(() => profileStore.activeProfile?.id)
const session = ref<LearningSession>()
const exercises = ref<ExerciseInstance[]>([])
const index = ref(0)
const answer = ref<ExerciseAnswer>('')
const hintLevel = ref(0)
const loading = ref(true)
const completed = ref(false)
const {
  feedback,
  saving,
  errorMessage,
  submit: submitExercise,
  reset: resetSubmission,
} = useExerciseSubmission()
const exercise = computed(() => exercises.value[index.value])
const progress = computed(() => ((index.value + (feedback.value ? 1 : 0)) / Math.max(exercises.value.length, 1)) * 100)

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (!profileId) return
  try {
    const result = await reviewRepository.start(profileId)
    session.value = result.session
    exercises.value = result.exercises
    index.value = result.session.currentExerciseIndex ?? 0
    answer.value =
      result.session.answerDrafts?.[result.exercises[index.value]?.id ?? ''] ?? ''
  } catch {
    errorMessage.value = 'Не вдалося відкрити чергу повторення.'
  } finally {
    loading.value = false
  }
})

function updateAnswer(value: ExerciseAnswer): void {
  answer.value = value
  if (session.value && exercise.value) {
    void learningRepository.saveAnswerDraft(session.value.id, exercise.value.id, value)
  }
}

async function submit(reveal = false): Promise<void> {
  const current = exercise.value
  const active = session.value
  const profileId = profileStore.activeProfile?.id
  if (!current || !active || !profileId) return
  await submitExercise({
    profileId,
    sessionId: active.id,
    exercise: current,
    answer: answer.value,
    hintLevel: hintLevel.value,
    reveal,
  })
}

async function next(): Promise<void> {
  if (!session.value || (feedback.value !== 'correct' && feedback.value !== 'revealed')) return
  if (index.value < exercises.value.length - 1) {
    index.value += 1
    answer.value = ''
    resetSubmission()
    hintLevel.value = 0
    await reviewRepository.savePosition(session.value, index.value)
    return
  }
  saving.value = true
  try {
    await reviewRepository.complete(session.value.id)
    completed.value = true
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="lesson-page page-shell">
    <div v-if="loading" class="loading-state" role="status">Готуємо повторення…</div>
    <div v-else-if="errorMessage" class="lesson-error" role="alert">{{ errorMessage }}</div>
    <div v-else-if="completed" class="question-block question-block--center">
      <MascotCard mood="celebrating" message="Клубочки знань стали міцнішими!" />
      <h1>Повторення завершено</h1>
      <p>Результати збережено, а наступні дати вже заплановано.</p>
      <BaseButton @click="router.push('/home')">На головну</BaseButton>
    </div>
    <div v-else-if="!exercises.length" class="question-block question-block--center">
      <MascotCard mood="celebrating" message="На сьогодні черга порожня." />
      <h1>Усе повторено</h1>
      <p>Нові вправи з’являться тут за твоїм розкладом.</p>
      <BaseButton @click="router.push('/home')">На головну</BaseButton>
    </div>
    <template v-else-if="exercise">
      <header class="lesson-header">
        <div>
          <span class="eyebrow">Повторення · {{ index + 1 }} із {{ exercises.length }}</span>
          <h1>{{ exercise.title ?? 'Пригадай знайомий крок' }}</h1>
        </div>
        <ProgressBar :value="progress" label="Прогрес повторення" />
      </header>
      <article class="practice-card">
        <p class="exercise-prompt">{{ exercise.prompt }}</p>
        <form class="answer-form" @submit.prevent="submit(false)">
          <ExerciseRenderer
            :model-value="answer"
            :exercise="exercise"
            :disabled="feedback === 'correct' || feedback === 'revealed'"
            :invalid="feedback === 'incorrect'"
            @update:model-value="updateAnswer"
          />
          <BaseButton v-if="feedback !== 'correct' && feedback !== 'revealed'" type="submit" :disabled="saving || isAnswerEmpty(answer)">
            Перевірити
          </BaseButton>
        </form>
        <div class="lesson-actions">
          <BaseButton
            v-if="feedback !== 'correct' && feedback !== 'revealed' && hintLevel < exercise.hints.length"
            variant="secondary"
            @click="hintLevel += 1"
          >
            Підказка
          </BaseButton>
          <BaseButton
            v-if="feedback !== 'correct' && feedback !== 'revealed'"
            variant="secondary"
            @click="submit(true)"
          >
            Не знаю
          </BaseButton>
        </div>
        <ul v-if="hintLevel" class="hint-list">
          <li v-for="hint in exercise.hints.slice(0, hintLevel)" :key="hint">{{ hint }}</li>
        </ul>
        <div class="feedback-region" aria-live="polite">
          <p v-if="feedback === 'correct'" class="feedback feedback--correct">Правильно. Цей крок уже впевненіший.</p>
          <p v-else-if="feedback === 'incorrect'" class="feedback feedback--incorrect">Відповідь не збіглася. Спробуй виправити або відкрий розв’язок.</p>
          <div v-else-if="feedback === 'revealed'" class="feedback feedback--revealed">
            <strong>Відповідь: {{ exercise.expectedAnswer }}</strong>
            <ol><li v-for="step in exercise.solutionSteps" :key="step">{{ step }}</li></ol>
          </div>
        </div>
        <BaseButton v-if="feedback === 'correct' || feedback === 'revealed'" :disabled="saving" @click="next">
          {{ index === exercises.length - 1 ? 'Завершити повторення' : 'Наступна вправа' }}
        </BaseButton>
      </article>
    </template>
  </section>
</template>
