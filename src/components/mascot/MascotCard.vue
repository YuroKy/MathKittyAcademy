<script setup lang="ts">
withDefaults(
  defineProps<{
    mood?: 'neutral' | 'encouraging' | 'celebrating' | 'thinking' | 'mistake' | 'sleeping'
    message?: string
    compact?: boolean
  }>(),
  {
    mood: 'neutral',
    message: '',
    compact: false,
  },
)

const moodLabels = {
  neutral: 'спокійна',
  encouraging: 'підбадьорює',
  celebrating: 'святкує',
  thinking: 'міркує',
  mistake: 'лагідно допомагає',
  sleeping: 'спить',
}
</script>

<template>
  <div :class="['mascot-card', { 'mascot-card--compact': compact }]">
    <div :class="['mascot', `mascot--${mood}`]">
      <svg viewBox="0 0 220 200" role="img" :aria-label="`Киця Мурка ${moodLabels[mood]}`">
        <path
          d="M49 78 38 22l48 29c15-7 33-7 48 0l48-29-11 56c9 13 14 29 14 46 0 42-33 70-75 70s-75-28-75-70c0-17 5-33 14-46Z"
          fill="#fff"
          stroke="currentColor"
          stroke-width="7"
          stroke-linejoin="round"
        />
        <path d="m48 36 29 18-22 13Zm124 0-29 18 22 13Z" fill="#fff0f6" />
        <ellipse cx="82" cy="112" rx="7" ry="9" fill="currentColor" />
        <ellipse cx="138" cy="112" rx="7" ry="9" fill="currentColor" />
        <path
          v-if="mood === 'celebrating'"
          d="M98 132q12 19 24 0"
          fill="#ec6f9e"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
        />
        <path
          v-else-if="mood === 'sleeping'"
          d="m73 111 16 2m42 0 16-2M102 135q8 6 16 0"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
        />
        <path
          v-else
          d="M103 132q7 8 14 0m-7-2v8"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
        />
        <path
          d="M145 52c12-17 37-9 36 11-1 14-17 22-36 35-18-13-35-21-36-35-1-20 24-28 36-11Z"
          fill="#8fc9e8"
          stroke="currentColor"
          stroke-width="6"
        />
        <g v-if="mood === 'thinking'" fill="#f6c85f" stroke="currentColor" stroke-width="2">
          <circle cx="193" cy="92" r="5" />
          <circle cx="207" cy="75" r="8" />
        </g>
        <g v-if="mood === 'celebrating'" fill="#f6c85f">
          <path d="m24 83 4 9 10 1-8 7 2 10-8-5-9 5 2-10-7-7 10-1Z" />
          <path d="m191 116 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" />
        </g>
      </svg>
    </div>
    <p v-if="message" class="mascot-card__message">{{ message }}</p>
  </div>
</template>
