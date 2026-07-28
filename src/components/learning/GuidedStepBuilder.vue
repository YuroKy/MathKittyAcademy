<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  title: string
  steps: string[]
  revealedCount: number
}>()

const emit = defineEmits<{
  'update:revealedCount': [count: number]
  complete: []
}>()

const lastAttemptCorrect = ref<boolean>()
const remainingIndexes = computed(() =>
  props.steps
    .map((_, index) => index)
    .filter((index) => index >= props.revealedCount)
    .reverse(),
)

function chooseStep(index: number): void {
  const correct = index === props.revealedCount
  lastAttemptCorrect.value = correct
  if (!correct) return

  const nextCount = props.revealedCount + 1
  emit('update:revealedCount', nextCount)
  if (nextCount === props.steps.length) emit('complete')
}
</script>

<template>
  <section class="interaction-card step-builder" aria-labelledby="step-builder-title">
    <span class="interaction-card__label">Склади розв’язання</span>
    <h2 id="step-builder-title">{{ title }}</h2>
    <ol class="built-steps">
      <li v-for="(step, index) in steps.slice(0, revealedCount)" :key="step">
        <span>{{ index + 1 }}</span>
        <p>{{ step }}</p>
      </li>
      <li v-if="revealedCount < steps.length" class="built-steps__empty">
        <span>{{ revealedCount + 1 }}</span>
        <p>Обери наступний логічний крок</p>
      </li>
    </ol>
    <div v-if="revealedCount < steps.length" class="step-options">
      <button
        v-for="index in remainingIndexes"
        :key="steps[index]"
        type="button"
        @click="chooseStep(index)"
      >
        {{ steps[index] }}
      </button>
    </div>
    <p v-if="lastAttemptCorrect === false" class="interaction-feedback" aria-live="polite">
      <strong>Цей крок знадобиться трохи пізніше.</strong>
      Спершу знайди дію, яка готує числа до обчислення.
    </p>
    <p v-else-if="revealedCount === steps.length" class="interaction-feedback" aria-live="polite">
      <strong>Послідовність готова.</strong>
      Кожен крок спирається на попередній.
    </p>
  </section>
</template>
