<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  question: string
  choices: string[]
  correctChoiceIndex: number
  selectedIndex?: number
}>()

const emit = defineEmits<{
  'update:selectedIndex': [index: number]
}>()

const answered = computed(() => props.selectedIndex !== undefined)
const isCorrect = computed(() => props.selectedIndex === props.correctChoiceIndex)

function choose(index: number): void {
  if (answered.value) return
  emit('update:selectedIndex', index)
}
</script>

<template>
  <section class="interaction-card prediction-card" aria-labelledby="prediction-question">
    <span class="interaction-card__label">Передбач відповідь</span>
    <h2 id="prediction-question">{{ question }}</h2>
    <div class="prediction-options">
      <button
        v-for="(choice, index) in choices"
        :key="choice"
        type="button"
        :class="[
          'prediction-option',
          {
            'prediction-option--selected': selectedIndex === index,
            'prediction-option--correct': answered && index === correctChoiceIndex,
            'prediction-option--incorrect': selectedIndex === index && !isCorrect,
          },
        ]"
        :aria-pressed="selectedIndex === index"
        :disabled="answered"
        @click="choose(index)"
      >
        <span>{{ String.fromCharCode(65 + index) }}</span>
        {{ choice }}
      </button>
    </div>
    <p v-if="answered" class="interaction-feedback" aria-live="polite">
      <strong>{{ isCorrect ? 'Точно!' : 'Гарна гіпотеза.' }}</strong>
      <slot name="explanation" />
    </p>
  </section>
</template>
