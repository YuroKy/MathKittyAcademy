<script setup lang="ts">
import { computed } from 'vue'

import { areEquivalentAnswers } from '@/domain/exercises/rational'
import type { ExerciseAnswer, ExerciseInstance } from '@/types/domain'

const props = defineProps<{
  exercise: ExerciseInstance
  modelValue: ExerciseAnswer
  disabled?: boolean
  invalid?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ExerciseAnswer]
}>()

const selectedChoices = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : [],
)
const matchedPairs = computed(() =>
  !Array.isArray(props.modelValue) && typeof props.modelValue === 'object'
    ? props.modelValue
    : {},
)
const stepAnswers = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue : [],
)
const matchingOptions = computed(() =>
  [...new Set(props.exercise.matchingPairs?.map((pair) => pair.right) ?? [])],
)

function selectSingle(choice: string): void {
  emit('update:modelValue', choice)
}

function toggleMultiple(choice: string): void {
  const current = [...selectedChoices.value]
  const index = current.indexOf(choice)
  if (index >= 0) current.splice(index, 1)
  else current.push(choice)
  emit('update:modelValue', current)
}

function updateMatch(left: string, right: string): void {
  emit('update:modelValue', { ...matchedPairs.value, [left]: right })
}

function updateStep(index: number, value: string): void {
  const current = [...stepAnswers.value]
  current[index] = value
  emit('update:modelValue', current)
}

function isStepCorrect(index: number): boolean {
  const definition = props.exercise.stepDefinitions?.[index]
  const value = stepAnswers.value[index]
  if (!definition || value === undefined) return false
  return definition.validationStrategy === 'exact'
    ? value.trim() === definition.expectedAnswer.trim()
    : areEquivalentAnswers(value, definition.expectedAnswer)
}

function isStepUnlocked(index: number): boolean {
  return index === 0 || isStepCorrect(index - 1)
}
</script>

<template>
  <div class="exercise-renderer">
    <div
      v-if="exercise.kind === 'singleChoice' || exercise.kind === 'multipleChoice'"
      class="exercise-choices"
      role="group"
      :aria-label="exercise.kind === 'multipleChoice' ? 'Оберіть усі правильні відповіді' : 'Оберіть відповідь'"
    >
      <button
        v-for="choice in exercise.choices"
        :key="choice"
        type="button"
        :aria-pressed="
          exercise.kind === 'multipleChoice'
            ? selectedChoices.includes(choice)
            : modelValue === choice
        "
        :disabled="disabled"
        @click="
          exercise.kind === 'multipleChoice'
            ? toggleMultiple(choice)
            : selectSingle(choice)
        "
      >
        {{ choice }}
      </button>
    </div>

    <fieldset v-else-if="exercise.kind === 'matching'" class="matching-board" :disabled="disabled">
      <legend>З’єднай відповідні пари</legend>
      <label v-for="pair in exercise.matchingPairs" :key="pair.left">
        <span>{{ pair.left }}</span>
        <select
          :value="matchedPairs[pair.left] ?? ''"
          :aria-label="`Пара для ${pair.left}`"
          @change="updateMatch(pair.left, ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>Оберіть пару</option>
          <option v-for="option in matchingOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
    </fieldset>

    <fieldset v-else-if="exercise.kind === 'stepByStep'" class="step-board" :disabled="disabled">
      <legend>Розв’яжи крок за кроком</legend>
      <label
        v-for="(step, stepIndex) in exercise.stepDefinitions"
        :key="step.id"
        :class="{ 'step-board__step--locked': !isStepUnlocked(stepIndex) }"
      >
        <span>{{ stepIndex + 1 }}. {{ step.prompt }}</span>
        <input
          :value="stepAnswers[stepIndex] ?? ''"
          :disabled="disabled || !isStepUnlocked(stepIndex)"
          inputmode="text"
          autocomplete="off"
          :aria-label="`Відповідь для кроку ${stepIndex + 1}`"
          :aria-invalid="Boolean(stepAnswers[stepIndex]) && !isStepCorrect(stepIndex)"
          @input="updateStep(stepIndex, ($event.target as HTMLInputElement).value)"
        />
        <small v-if="isStepCorrect(stepIndex)" role="status">Крок правильний ✓</small>
      </label>
    </fieldset>

    <label v-else class="exercise-input">
      <span>Твоя відповідь</span>
      <input
        :value="typeof modelValue === 'string' ? modelValue : ''"
        :inputmode="exercise.kind === 'fractionInput' ? 'text' : 'decimal'"
        autocomplete="off"
        :placeholder="exercise.kind === 'fractionInput' ? 'Наприклад, 3/6' : 'Введи число'"
        :aria-invalid="invalid"
        :disabled="disabled"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </label>
  </div>
</template>

<style scoped>
.exercise-renderer,
.matching-board,
.step-board {
  display: grid;
  gap: 0.85rem;
}

.exercise-choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.75rem;
}

.exercise-choices button,
.matching-board select,
.step-board input,
.exercise-input input {
  min-height: 44px;
}

.exercise-choices button[aria-pressed='true'] {
  border-color: var(--color-primary, #7654d8);
  box-shadow: 0 0 0 3px rgb(118 84 216 / 18%);
}

.matching-board,
.step-board {
  border: 0;
  padding: 0;
}

.matching-board label,
.step-board label,
.exercise-input {
  display: grid;
  gap: 0.35rem;
}

.matching-board label {
  grid-template-columns: minmax(8rem, 1fr) minmax(10rem, 1fr);
  align-items: center;
}

.step-board__step--locked {
  opacity: 0.58;
}

.step-board small {
  color: var(--color-success, #267653);
}
</style>
