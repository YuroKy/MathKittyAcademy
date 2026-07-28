<script setup lang="ts">
export type MascotMood =
  | 'neutral'
  | 'encouraging'
  | 'explaining'
  | 'celebrating'
  | 'thinking'
  | 'mistake'
  | 'confused'
  | 'sleeping'

const props = withDefaults(
  defineProps<{
    mood?: MascotMood
  }>(),
  {
    mood: 'neutral',
  },
)

const moodLabels: Record<MascotMood, string> = {
  neutral: 'спокійно усміхається',
  encouraging: 'підбадьорює',
  explaining: 'пояснює тему з чарівним олівцем',
  celebrating: 'радісно святкує',
  thinking: 'уважно міркує',
  mistake: 'лагідно допомагає після помилки',
  confused: 'розплутує складний крок разом',
  sleeping: 'відпочиває в офлайн-режимі',
}
</script>

<template>
  <img
    :class="['anime-mascot-image', `anime-mascot-image--${props.mood}`]"
    src="/murka-anime-v2.png"
    :alt="`Аніме-кицька Мурка ${moodLabels[props.mood]}`"
    draggable="false"
  />
</template>
