<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { useActivityTracker } from '@/composables/useActivityTracker'
import { diagnosticDefinitions } from '@/content/diagnostic/diagnosticExercises'
import { validateExerciseAnswer } from '@/domain/exercises/validateAnswer'
import {
  diagnosticRepository,
  type DiagnosticResult,
} from '@/infrastructure/repositories/diagnosticRepository'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { ExerciseInstance, LearningSession } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()
useActivityTracker(() => profileStore.activeProfile?.id)
const session = ref<LearningSession>()
const exercises = ref<ExerciseInstance[]>([])
const index = ref(0)
const answer = ref('')
const feedback = ref<'correct' | 'incorrect' | 'unknown' | ''>('')
const result = ref<DiagnosticResult>()
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const started = ref(false)
const exercise = computed(() => exercises.value[index.value])
const progress = computed(() => ((index.value + (feedback.value ? 1 : 0)) / Math.max(exercises.value.length, 1)) * 100)

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (!profileId) return
  try {
    const active = await diagnosticRepository.start(profileId)
    session.value = active.session
    exercises.value = active.exercises
    index.value = active.session.currentExerciseIndex ?? 0
    started.value = index.value > 0
  } catch {
    errorMessage.value = 'Не вдалося відкрити діагностику. Спробуй ще раз.'
  } finally {
    loading.value = false
  }
})

async function submit(unknown = false): Promise<void> {
  const current = exercise.value
  const active = session.value
  const profileId = profileStore.activeProfile?.id
  if (!current || !active || !profileId || saving.value || (!unknown && !answer.value.trim())) return
  saving.value = true
  try {
    const correct = !unknown && validateExerciseAnswer(current, answer.value)
    await learningRepository.recordAttempt({
      profileId,
      sessionId: active.id,
      exerciseId: current.id,
      templateId: current.templateId,
      seed: current.seed,
      topicId: current.topicId,
      skillIds: current.skillIds,
      prompt: current.prompt,
      expectedAnswer: current.expectedAnswer,
      submittedAnswer: unknown ? 'Не знаю' : answer.value,
      normalizedAnswer: unknown ? '' : answer.value.trim().replace(',', '.'),
      isCorrect: correct,
      hintLevelUsed: unknown ? 2 : 0,
    })
    feedback.value = unknown ? 'unknown' : correct ? 'correct' : 'incorrect'
  } finally {
    saving.value = false
  }
}

async function next(): Promise<void> {
  if (!session.value || !exercise.value || !feedback.value) return
  const addFollowUp =
    feedback.value === 'correct' ? undefined : exercise.value.skillIds[0]
  const nextIndex = index.value + 1
  await diagnosticRepository.saveProgress(session.value, nextIndex, addFollowUp)
  exercises.value = diagnosticRepository.restoreExercises(session.value)
  if (nextIndex < exercises.value.length) {
    index.value = nextIndex
    answer.value = ''
    feedback.value = ''
    return
  }
  saving.value = true
  try {
    result.value = await diagnosticRepository.complete(session.value.id)
    await profileStore.refresh()
  } finally {
    saving.value = false
  }
}

function skillLabel(id: string): string {
  return diagnosticDefinitions.find((entry) => entry.skillId === id)?.title ?? id
}

async function skipDiagnostic(): Promise<void> {
  const profileId = profileStore.activeProfile?.id
  if (!profileId) return
  await diagnosticRepository.skip(profileId, session.value?.id)
  await profileStore.refresh()
  await router.replace('/home')
}
</script>

<template>
  <section class="lesson-page page-shell">
    <div v-if="loading" class="loading-state" role="status">Готуємо спокійний старт…</div>
    <div v-else-if="errorMessage" class="lesson-error" role="alert">{{ errorMessage }}</div>
    <div v-else-if="!started && !result" class="question-block question-block--center">
      <MascotCard mood="encouraging" message="Це не контрольна — я лише допоможу знайти зручний старт." />
      <span class="eyebrow">12–18 коротких кроків · без таймера</span>
      <h1>Знайдемо твою стартову точку</h1>
      <p>Відповіді зберігаються після кожного кроку, тому можна повернутися пізніше.</p>
      <BaseButton @click="started = true">Почати діагностику</BaseButton>
      <BaseButton variant="secondary" @click="skipDiagnostic">Пропустити зараз</BaseButton>
    </div>
    <div v-else-if="result" class="diagnostic-result">
      <MascotCard mood="celebrating" message="Тепер академія знає, з чого буде найзручніше почати." />
      <header class="page-heading">
        <span class="eyebrow">Без оцінок і поспіху</span>
        <h1>Твоя стартова карта готова</h1>
      </header>
      <div class="settings-grid">
        <section class="settings-card"><h2>Уже вмію</h2><p>{{ result.strong.map(skillLabel).join(', ') || 'Це ще з’ясуємо під час навчання.' }}</p></section>
        <section class="settings-card"><h2>Треба повторити</h2><p>{{ result.review.map(skillLabel).join(', ') || 'Немає окремих тем для короткого повторення.' }}</p></section>
        <section class="settings-card"><h2>Починаємо з основ</h2><p>{{ result.foundation.map(skillLabel).join(', ') || 'Базові кроки вже впевнені.' }}</p></section>
      </div>
      <BaseButton @click="router.push(result.recommendedTopicId ? `/learn/${result.recommendedTopicId}` : '/home')">
        Почати рекомендовану тему
      </BaseButton>
    </div>
    <template v-else-if="started && exercise">
      <header class="lesson-header">
        <div>
          <span class="eyebrow">Діагностика · приблизно 10–15 хв</span>
          <h1>{{ exercise.title }}</h1>
        </div>
        <ProgressBar :value="progress" label="Прогрес діагностики" />
      </header>
      <article class="practice-card">
        <p>Це не контрольна. Відповідай як виходить, а якщо не знаєш — так і скажи.</p>
        <h2>{{ exercise.prompt }}</h2>
        <form class="answer-form" @submit.prevent="submit(false)">
          <input v-model="answer" inputmode="decimal" :disabled="Boolean(feedback)" aria-label="Відповідь" />
          <BaseButton v-if="!feedback" type="submit" :disabled="saving">Відповісти</BaseButton>
        </form>
        <BaseButton v-if="!feedback" variant="secondary" @click="submit(true)">Не знаю</BaseButton>
        <p v-if="feedback === 'correct'" class="feedback feedback--correct" aria-live="polite">Відповідь записано.</p>
        <p v-else-if="feedback" class="feedback feedback--revealed" aria-live="polite">Дякую, цей крок допоможе підібрати старт.</p>
        <BaseButton v-if="feedback" :disabled="saving" @click="next">Продовжити</BaseButton>
      </article>
    </template>
  </section>
</template>
