<script setup lang="ts">
import AnimeMascot, { type MascotMood } from './AnimeMascot.vue'

withDefaults(
  defineProps<{
    mood?: MascotMood
    message?: string
    compact?: boolean
  }>(),
  {
    mood: 'neutral',
    message: '',
    compact: false,
  },
)
</script>

<template>
  <div :class="['mascot-card', { 'mascot-card--compact': compact }]">
    <div :class="['mascot', `mascot--${mood}`]">
      <AnimeMascot :mood="mood" />
    </div>
    <p v-if="message" class="mascot-card__message">{{ message }}</p>
  </div>
</template>
