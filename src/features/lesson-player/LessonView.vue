<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import MathExpression from '@/components/math/MathExpression.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { findTopic } from '@/content/curriculum/topics'
import { buildNaturalNumbersExerciseSet } from '@/domain/exercises/generator'
import { areEquivalentAnswers } from '@/domain/exercises/rational'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import { useProfileStore } from '@/stores/profile'
import type { ExerciseInstance, LearningSession } from '@/types/domain'

type LessonStage =
  | 'introduction'
  | 'explanation'
  | 'visual-example'
  | 'guided-example'
  | 'practice'
  | 'summary'

const stageOrder: LessonStage[] = [
  'introduction',
  'explanation',
  'visual-example',
  'guided-example',
  'practice',
  'summary',
]

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const topic = computed(() => findTopic(String(route.params.topicId)))
const supported = computed(() => topic.value?.id === 'natural-numbers')
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
const lessonCompleted = ref(false)

const currentExercise = computed(() => exercises.value[exerciseIndex.value])
const stageIndex = computed(() => stageOrder.indexOf(stage.value))
const overallProgress = computed(() => {
  if (stage.value === 'practice') {
    const practiceSlice = exerciseIndex.value / Math.max(exercises.value.length, 1)
    return ((stageIndex.value + practiceSlice) / (stageOrder.length - 1)) * 100
  }
  return (stageIndex.value / (stageOrder.length - 1)) * 100
})
const visibleHints = computed(() => currentExercise.value?.hints.slice(0, hintLevel.value) ?? [])

onMounted(async () => {
  const profileId = profileStore.activeProfile?.id
  if (!profileId || !topic.value || !supported.value) {
    loading.value = false
    return
  }

  try {
    session.value = await learningRepository.startLesson(profileId, topic.value.id)
    exercises.value = buildNaturalNumbersExerciseSet(session.value.id)
    stage.value = isLessonStage(session.value.currentStage)
      ? session.value.currentStage
      : 'introduction'
    exerciseIndex.value = Math.min(
      session.value.currentExerciseIndex ?? 0,
      exercises.value.length - 1,
    )
    const seeds = exercises.value.map((exercise) => exercise.seed)
    if (session.value.exerciseSeeds.length === 0) {
      await learningRepository.saveLessonPosition(
        session.value.id,
        stage.value,
        exerciseIndex.value,
        seeds,
      )
      session.value.exerciseSeeds = seeds
    }
  } catch (error) {
    console.error('Failed to start lesson', error)
    errorMessage.value =
      'Не вдалося відкрити урок. Твій завершений прогрес у безпеці — спробуй ще раз.'
  } finally {
    loading.value = false
  }
})

function isLessonStage(value: string | undefined): value is LessonStage {
  return value !== undefined && stageOrder.includes(value as LessonStage)
}

async function savePosition(nextStage: LessonStage, nextIndex = exerciseIndex.value): Promise<void> {
  if (!session.value) return
  await learningRepository.saveLessonPosition(
    session.value.id,
    nextStage,
    nextIndex,
    exercises.value.map((exercise) => exercise.seed),
  )
}

async function continueLesson(): Promise<void> {
  const next = stageOrder[stageIndex.value + 1]
  if (!next || next === 'summary') return
  stage.value = next
  await savePosition(next)
}

async function submitAnswer(): Promise<void> {
  const exercise = currentExercise.value
  const activeSession = session.value
  const profileId = profileStore.activeProfile?.id
  if (!exercise || !activeSession || !profileId || answer.value.trim() === '' || saving.value) return

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
    lessonCompleted.value = true
    stage.value = 'summary'
    session.value.status = 'completed'
    session.value.earnedXp = 40
  } catch (error) {
    console.error('Failed to complete lesson', error)
    errorMessage.value = 'Урок завершено, але підсумок не зберігся. Спробуй натиснути ще раз.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="lesson-page">
    <header class="lesson-header">
      <button class="icon-button" type="button" aria-label="Вийти з уроку" @click="router.push('/home')">
        ×
      </button>
      <div>
        <span>{{ topic?.title ?? 'Урок' }}</span>
        <ProgressBar :value="overallProgress" label="Прогрес уроку" />
      </div>
      <span class="lesson-time">≈ {{ topic?.estimatedMinutes ?? 10 }} хв</span>
    </header>

    <div v-if="loading" class="loading-state" role="status">Готуємо зошит і вправи…</div>

    <div v-else-if="errorMessage && !session" class="lesson-error" role="alert">
      <MascotCard mood="mistake" :message="errorMessage" />
      <BaseButton @click="router.push('/home')">Повернутися на головну</BaseButton>
    </div>

    <div v-else-if="!topic" class="lesson-error">
      <MascotCard mood="thinking" message="Не знайшла цю тему на карті академії." />
      <BaseButton @click="router.push('/map')">Відкрити карту</BaseButton>
    </div>

    <div v-else-if="!supported" class="lesson-error">
      <MascotCard
        mood="thinking"
        message="Кімнату вже видно на карті, але її повний урок ще готується."
      />
      <div class="question-block question-block--center">
        <span class="eyebrow">Наступний етап розробки</span>
        <h1>{{ topic.title }}</h1>
        <p>
          Метадані й передумови цієї теми вже працюють. Перший повністю інтерактивний урок
          зараз доступний у кімнаті натуральних чисел.
        </p>
      </div>
      <BaseButton @click="router.push('/learn/natural-numbers')">
        Відкрити готовий урок
      </BaseButton>
    </div>

    <article v-else class="lesson-card">
      <template v-if="stage === 'introduction'">
        <MascotCard
          mood="encouraging"
          message="Сьогодні пригадаємо чотири звичні дії. Це опора для всього, що буде далі."
        />
        <div class="lesson-copy">
          <span class="eyebrow">Крок 1 · Знайомство</span>
          <h1>Числа — це наші будівельні кубики</h1>
          <p>
            За одне коротке заняття потренуємо додавання, віднімання та множення.
            Поспішати не треба: швидкість тут не впливає на прогрес.
          </p>
        </div>
      </template>

      <template v-else-if="stage === 'explanation'">
        <div class="lesson-copy">
          <span class="eyebrow">Крок 2 · Ідея</span>
          <h1>Кожна дія відповідає на своє запитання</h1>
          <div class="operation-list">
            <div><span>+</span><p><strong>Додати</strong> — скільки буде разом?</p></div>
            <div><span>−</span><p><strong>Відняти</strong> — скільки залишиться?</p></div>
            <div><span>×</span><p><strong>Помножити</strong> — скільки в однакових групах?</p></div>
            <div><span>÷</span><p><strong>Поділити</strong> — скільки в кожній рівній групі?</p></div>
          </div>
        </div>
      </template>

      <template v-else-if="stage === 'visual-example'">
        <div class="lesson-copy">
          <span class="eyebrow">Крок 3 · Побачимо</span>
          <h1>Три групи по чотири</h1>
          <div class="dot-groups" aria-label="Три групи, у кожній по чотири крапки">
            <div v-for="group in 3" :key="group">
              <span v-for="dot in 4" :key="dot" />
            </div>
          </div>
          <MathExpression expression="3 \times 4 = 12" display label="Три помножити на чотири дорівнює дванадцять" />
          <p>
            Множення — короткий запис однакового додавання:
            <strong>4 + 4 + 4 = 12</strong>.
          </p>
        </div>
      </template>

      <template v-else-if="stage === 'guided-example'">
        <div class="lesson-copy">
          <span class="eyebrow">Крок 4 · Разом</span>
          <h1>Знайдемо 27 + 16</h1>
          <ol class="solution-steps">
            <li><span>1</span><p>Розкладемо 16 на <strong>10 + 6</strong>.</p></li>
            <li><span>2</span><p>Додамо десяток: <strong>27 + 10 = 37</strong>.</p></li>
            <li><span>3</span><p>Додамо решту: <strong>37 + 6 = 43</strong>.</p></li>
          </ol>
          <div class="guided-result">
            <span aria-hidden="true">✓</span>
            <MathExpression expression="27 + 16 = 43" label="Двадцять сім плюс шістнадцять дорівнює сорок три" />
          </div>
        </div>
      </template>

      <template v-else-if="stage === 'practice' && currentExercise">
        <div class="exercise-shell">
          <div class="exercise-meta">
            <span class="eyebrow">Твоя спроба · {{ exerciseIndex + 1 }}/{{ exercises.length }}</span>
            <span class="difficulty-pill">основа</span>
          </div>
          <h1>Обчисли вираз</h1>
          <MathExpression
            :expression="currentExercise.prompt.replace('?', '')"
            display
            :label="currentExercise.prompt"
          />

          <form class="answer-form" @submit.prevent="submitAnswer">
            <label class="field">
              <span>Твоя відповідь</span>
              <input
                v-model="answer"
                inputmode="numeric"
                autocomplete="off"
                placeholder="Введи число"
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
              <span aria-hidden="true">✦</span>
              Підказка
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
                <strong>Так, відповідь підходить!</strong>
                <p>{{ currentExercise.solutionSteps[0] }}</p>
              </div>
            </div>
            <div v-else-if="feedback === 'incorrect'" class="feedback feedback--incorrect">
              <span aria-hidden="true">↻</span>
              <div>
                <strong>Розплутаємо цей крок разом</strong>
                <p>
                  Схоже, обчислення десь звернуло не туди. Відкрий підказку або зміни
                  відповідь і перевір ще раз.
                </p>
              </div>
            </div>
            <div v-else-if="feedback === 'revealed'" class="feedback feedback--revealed">
              <span aria-hidden="true">✦</span>
              <div>
                <strong>Ось як це розв’язати</strong>
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
            {{ exerciseIndex === exercises.length - 1 ? 'Завершити заняття' : 'Наступне завдання' }}
          </BaseButton>
        </div>
      </template>

      <template v-else-if="stage === 'summary'">
        <MascotCard
          mood="celebrating"
          message="Готово! Ти не просто відповіла — ти створила основу для наступної теми."
        />
        <div class="lesson-copy lesson-copy--center">
          <span class="eyebrow">Заняття завершено</span>
          <h1>Ще один надійний крок</h1>
          <p>
            Тепер у карті відкрилися наступні кімнати. Вправи з цього уроку повернуться
            у повторенні завтра.
          </p>
          <div class="reward-row">
            <span><strong>+40</strong> XP</span>
            <span><strong>1</strong> новий крок</span>
            <span aria-label="Досягнення: перший урок"><strong>★</strong> відзнака</span>
          </div>
        </div>
      </template>

      <p v-if="errorMessage && session" class="inline-error" role="alert">{{ errorMessage }}</p>

      <footer v-if="stage !== 'practice'" class="lesson-actions">
        <BaseButton
          v-if="stage !== 'summary'"
          @click="continueLesson"
        >
          Продовжити
          <span aria-hidden="true">→</span>
        </BaseButton>
        <BaseButton v-else @click="router.push('/home')">
          Повернутися на головну
        </BaseButton>
      </footer>
    </article>
  </section>
</template>
