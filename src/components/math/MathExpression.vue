<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = withDefaults(
  defineProps<{
    expression: string
    display?: boolean
    label?: string
  }>(),
  {
    display: false,
    label: 'Математичний вираз',
  },
)

const html = computed(() =>
  katex.renderToString(props.expression, {
    displayMode: props.display,
    throwOnError: false,
    strict: 'warn',
    trust: false,
  }),
)
</script>

<template>
  <span
    :class="['math-expression', { 'math-expression--display': display }]"
    role="img"
    :aria-label="label"
    v-html="html"
  />
</template>
