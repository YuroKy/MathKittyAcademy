<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    label: string
    showValue?: boolean
  }>(),
  {
    max: 100,
    showValue: false,
  },
)

const safeValue = computed(() => Math.max(0, Math.min(props.value, props.max)))
</script>

<template>
  <div class="progress" :aria-label="label">
    <div class="progress__track">
      <div
        class="progress__value"
        :style="{ width: `${(safeValue / max) * 100}%` }"
        role="progressbar"
        :aria-valuenow="safeValue"
        aria-valuemin="0"
        :aria-valuemax="max"
        :aria-label="label"
      />
    </div>
    <span v-if="showValue" class="progress__label">{{ safeValue }} / {{ max }}</span>
  </div>
</template>
