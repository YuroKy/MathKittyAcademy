<script setup lang="ts">
import { useId } from 'vue'

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

const id = useId().replaceAll(':', '')
const eyeGradientId = `${id}-anime-eye`
const scarfGradientId = `${id}-anime-scarf`

const moodLabels: Record<MascotMood, string> = {
  neutral: 'спокійно усміхається',
  encouraging: 'підбадьорює',
  explaining: 'пояснює тему',
  celebrating: 'радісно святкує',
  thinking: 'уважно міркує',
  mistake: 'лагідно допомагає після помилки',
  confused: 'розплутує складний крок разом',
  sleeping: 'спить в офлайн-режимі',
}
</script>

<template>
  <svg
    :class="['anime-mascot-svg', `anime-mascot-svg--${props.mood}`]"
    viewBox="0 0 320 390"
    role="img"
    :aria-label="`Анімешна кицька Мурка ${moodLabels[props.mood]}`"
  >
    <defs>
      <linearGradient :id="eyeGradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#397c9d" />
        <stop offset="0.55" stop-color="#69b9dc" />
        <stop offset="1" stop-color="#bdefff" />
      </linearGradient>
      <linearGradient :id="scarfGradientId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ef7eaa" />
        <stop offset="1" stop-color="#c93670" />
      </linearGradient>
      <filter :id="`${id}-shadow`" x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#6f3853" flood-opacity=".14" />
      </filter>
    </defs>

    <g class="anime-mascot__shadow">
      <ellipse cx="158" cy="363" rx="86" ry="18" fill="#d9b8c7" opacity=".28" />
    </g>

    <g class="anime-mascot__tail" fill="none" stroke="#3f3440" stroke-width="9" stroke-linecap="round">
      <path d="M217 276c55 6 69-38 48-61-16-17-38-4-28 14" />
      <path d="M217 276c55 6 69-38 48-61-16-17-38-4-28 14" stroke="#fff" stroke-width="20" />
    </g>

    <g :filter="`url(#${id}-shadow)`">
      <path
        d="M106 229c12-25 29-37 52-37s42 13 54 38l19 83c4 21-12 41-34 41h-76c-22 0-39-21-33-42Z"
        fill="#fff"
        stroke="#3f3440"
        stroke-width="8"
        stroke-linejoin="round"
      />
      <path d="M113 278c29 14 63 14 94 0l9 39H102Z" fill="#fff0f6" />

      <g class="anime-mascot__legs">
        <path d="M119 333v27c0 13 27 13 28-1l2-24" fill="#fff" stroke="#3f3440" stroke-width="8" />
        <path d="m174 335 2 24c1 14 28 14 28 1v-27" fill="#fff" stroke="#3f3440" stroke-width="8" />
      </g>

      <g class="anime-mascot__arm anime-mascot__arm--left">
        <path
          :d="
            props.mood === 'celebrating'
              ? 'M111 245C73 230 65 194 80 179'
              : props.mood === 'explaining'
                ? 'M111 246c-34 3-50-9-60-25'
                : 'M111 246c-30 10-39 33-30 48'
          "
          fill="none"
          stroke="#3f3440"
          stroke-width="24"
          stroke-linecap="round"
        />
        <path
          :d="
            props.mood === 'celebrating'
              ? 'M111 245C73 230 65 194 80 179'
              : props.mood === 'explaining'
                ? 'M111 246c-34 3-50-9-60-25'
                : 'M111 246c-30 10-39 33-30 48'
          "
          fill="none"
          stroke="#fff"
          stroke-width="14"
          stroke-linecap="round"
        />
      </g>

      <g class="anime-mascot__arm anime-mascot__arm--right">
        <path
          :d="
            props.mood === 'celebrating'
              ? 'M205 244c36-17 43-53 27-67'
              : props.mood === 'thinking'
                ? 'M206 247c29-18 24-49 7-57'
                : 'M206 247c28 10 36 34 26 48'
          "
          fill="none"
          stroke="#3f3440"
          stroke-width="24"
          stroke-linecap="round"
        />
        <path
          :d="
            props.mood === 'celebrating'
              ? 'M205 244c36-17 43-53 27-67'
              : props.mood === 'thinking'
                ? 'M206 247c29-18 24-49 7-57'
                : 'M206 247c28 10 36 34 26 48'
          "
          fill="none"
          stroke="#fff"
          stroke-width="14"
          stroke-linecap="round"
        />
      </g>

      <path
        d="M108 206c12-13 29-19 50-19 22 0 39 7 52 20l-6 30c-28 14-61 14-90 0Z"
        :fill="`url(#${scarfGradientId})`"
        stroke="#3f3440"
        stroke-width="7"
      />
      <path d="m177 230 23 47 16-29-13-30Z" fill="#ef7eaa" stroke="#3f3440" stroke-width="7" />
      <circle cx="158" cy="216" r="10" fill="#f6c85f" stroke="#3f3440" stroke-width="5" />

      <path
        d="M78 82 60 22l62 36c23-10 49-10 72 0l64-36-20 62c18 20 28 46 28 75 0 62-48 100-107 100S51 221 51 159c0-30 10-56 27-77Z"
        fill="#fff"
        stroke="#3f3440"
        stroke-width="9"
        stroke-linejoin="round"
      />
      <path d="m73 42 40 23-30 22Zm171 0-42 23 31 23Z" fill="#ffdbe8" />

      <path
        d="M116 54c11-16 28-23 45-20 12 2 20 10 19 18-2 10-17 7-22 16-5 10 7 15 2 24-8-5-15-12-18-20-8 9-18 14-31 15 4-14 4-23 5-33Z"
        fill="#fff"
        stroke="#3f3440"
        stroke-width="7"
        stroke-linejoin="round"
      />

      <g class="anime-mascot__clip">
        <path
          d="m219 64 8 16 18 2-13 12 4 18-17-9-16 9 3-18-13-12 18-2Z"
          fill="#8fc9e8"
          stroke="#3f3440"
          stroke-width="6"
          stroke-linejoin="round"
        />
        <circle cx="219" cy="86" r="5" fill="#fff" />
      </g>

      <g v-if="props.mood === 'sleeping'" class="anime-mascot__sleeping-eyes">
        <path d="M88 145q18 13 36 0M194 145q18 13 36 0" fill="none" stroke="#3f3440" stroke-width="8" stroke-linecap="round" />
      </g>
      <g v-else class="anime-mascot__eyes">
        <ellipse cx="107" cy="147" rx="23" ry="30" fill="#fff" stroke="#3f3440" stroke-width="7" />
        <ellipse cx="211" cy="147" rx="23" ry="30" fill="#fff" stroke="#3f3440" stroke-width="7" />
        <ellipse cx="109" cy="151" rx="14" ry="21" :fill="`url(#${eyeGradientId})`" />
        <ellipse cx="209" cy="151" rx="14" ry="21" :fill="`url(#${eyeGradientId})`" />
        <ellipse cx="109" cy="158" rx="7" ry="11" fill="#263b4e" />
        <ellipse cx="209" cy="158" rx="7" ry="11" fill="#263b4e" />
        <circle cx="103" cy="141" r="6" fill="#fff" />
        <circle cx="203" cy="141" r="6" fill="#fff" />
        <circle cx="114" cy="164" r="3" fill="#fff" opacity=".8" />
        <circle cx="214" cy="164" r="3" fill="#fff" opacity=".8" />
      </g>

      <path
        v-if="props.mood === 'mistake' || props.mood === 'confused'"
        d="M145 193q14-10 28 0"
        fill="none"
        stroke="#3f3440"
        stroke-width="6"
        stroke-linecap="round"
      />
      <path
        v-else-if="props.mood === 'celebrating'"
        d="M142 188q17 25 34 0"
        fill="#ec6f9e"
        stroke="#3f3440"
        stroke-width="6"
        stroke-linejoin="round"
      />
      <path
        v-else
        d="M146 187q13 13 26 0"
        fill="none"
        stroke="#3f3440"
        stroke-width="6"
        stroke-linecap="round"
      />
      <path d="M159 178v10" stroke="#3f3440" stroke-width="5" stroke-linecap="round" />
      <path d="m151 177 8-5 8 5-8 6Z" fill="#ec6f9e" />

      <g class="anime-mascot__whiskers" stroke="#756a76" stroke-width="4" stroke-linecap="round">
        <path d="M80 184 38 176M82 196l-40 8M238 184l42-8M236 196l40 8" />
      </g>
      <ellipse cx="77" cy="179" rx="17" ry="9" fill="#f7a9c4" opacity=".35" />
      <ellipse cx="241" cy="179" rx="17" ry="9" fill="#f7a9c4" opacity=".35" />
    </g>

    <g v-if="props.mood === 'celebrating'" class="anime-mascot__sparkles" fill="#f6c85f">
      <path d="m31 115 6 13 14 2-10 9 3 14-13-7-13 7 3-14-10-9 14-2Z" />
      <path d="m283 122 5 10 11 2-8 7 2 11-10-5-10 5 2-11-8-7 11-2Z" />
      <circle cx="45" cy="70" r="6" fill="#8fc9e8" />
      <circle cx="280" cy="80" r="7" fill="#ec6f9e" />
    </g>

    <g v-if="props.mood === 'thinking' || props.mood === 'confused'" class="anime-mascot__thoughts">
      <circle cx="270" cy="176" r="8" fill="#fff" stroke="#3f3440" stroke-width="4" />
      <circle cx="291" cy="151" r="13" fill="#fff" stroke="#3f3440" stroke-width="4" />
      <text x="286" y="158" fill="#c93670" font-size="22" font-weight="900">?</text>
    </g>

    <g v-if="props.mood === 'explaining'" class="anime-mascot__pointer">
      <path d="M51 221 17 174" stroke="#7c5a3d" stroke-width="6" stroke-linecap="round" />
      <path d="m13 168 5 4 5 7-7 2-8-6Z" fill="#f6c85f" stroke="#3f3440" stroke-width="3" />
    </g>

    <g v-if="props.mood === 'sleeping'" class="anime-mascot__sleep">
      <text x="247" y="116" fill="#8fc9e8" font-size="26" font-weight="900">z</text>
      <text x="272" y="89" fill="#8fc9e8" font-size="34" font-weight="900">Z</text>
    </g>
  </svg>
</template>
