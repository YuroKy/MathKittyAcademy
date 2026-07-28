<script setup lang="ts">
defineProps<{
  name:
    | 'arrow-right'
    | 'book'
    | 'calendar'
    | 'chart'
    | 'check'
    | 'clock'
    | 'close'
    | 'collection'
    | 'crown'
    | 'flame'
    | 'gem'
    | 'gift'
    | 'heart'
    | 'home'
    | 'lock'
    | 'map'
    | 'paw'
    | 'play'
    | 'progress'
    | 'ribbon'
    | 'settings'
    | 'sparkles'
    | 'star'
    | 'target'
    | 'trophy'
}>()
</script>

<template>
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'home'">
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </template>
    <template v-else-if="name === 'map'">
      <path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2Z" />
      <path d="M8 4v13M16 7v13" />
    </template>
    <template v-else-if="name === 'progress' || name === 'chart'">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </template>
    <template v-else-if="name === 'collection'">
      <path d="M5 4h14v16H5z" />
      <path d="M8 2v4M16 2v4M8 9h8M8 13h5M8 17h7" />
    </template>
    <template v-else-if="name === 'heart'">
      <path
        d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"
      />
    </template>
    <template v-else-if="name === 'flame'">
      <path
        d="M12 22c4 0 7-3 7-7 0-3-1.5-5.6-4.4-8.1.2 2.6-1.1 4-2.2 4.7.3-3.9-2-6.8-5-9.6.2 4.1-2.4 6.7-2.4 11 0 5 3 9 7 9Z"
      />
    </template>
    <template v-else-if="name === 'star'">
      <path d="m12 2.5 2.9 5.8 6.4.9-4.6 4.5 1.1 6.3-5.8-3-5.8 3 1.1-6.3-4.6-4.5 6.4-.9Z" />
    </template>
    <template v-else-if="name === 'crown'">
      <path d="m3 7 4 4 5-7 5 7 4-4-2 12H5Z" />
      <path d="M5 16h14" />
    </template>
    <template v-else-if="name === 'book'">
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22Z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22Z" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="m5 12 4 4L19 6" />
    </template>
    <template v-else-if="name === 'lock'">
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </template>
    <template v-else-if="name === 'play'">
      <path d="m8 5 11 7-11 7Z" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="m6 6 12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'sparkles'">
      <path d="m12 2 1.3 4.2L17 8l-3.7 1.8L12 14l-1.3-4.2L7 8l3.7-1.8Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z" />
      <path d="m5 13 .7 1.8 1.8.7-1.8.7L5 18l-.7-1.8-1.8-.7 1.8-.7Z" />
    </template>
    <template v-else-if="name === 'paw'">
      <ellipse cx="12" cy="15.5" rx="5.5" ry="4.5" />
      <ellipse cx="6" cy="9" rx="2" ry="2.7" />
      <ellipse cx="10" cy="6" rx="2" ry="2.7" />
      <ellipse cx="14.5" cy="6" rx="2" ry="2.7" />
      <ellipse cx="18.5" cy="9.5" rx="2" ry="2.7" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </template>
    <template v-else-if="name === 'target'">
      <circle cx="11" cy="13" r="8" />
      <circle cx="11" cy="13" r="3" />
      <path d="m14 10 7-7M17 3h4v4" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </template>
    <template v-else-if="name === 'trophy'">
      <path d="M8 4h8v5a4 4 0 0 1-8 0Z" />
      <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6" />
    </template>
    <template v-else-if="name === 'gift'">
      <rect x="3" y="9" width="18" height="12" rx="2" />
      <path
        d="M12 9v12M3 13h18M7.5 9C5 9 4 7.7 4 6.4 4 5 5.2 4 6.6 4 9 4 12 9 12 9ZM16.5 9C19 9 20 7.7 20 6.4 20 5 18.8 4 17.4 4 15 4 12 9 12 9Z"
      />
    </template>
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"
      />
    </template>
    <template v-else-if="name === 'gem'">
      <path d="m4 8 4-5h8l4 5-8 13Z" />
      <path d="M4 8h16M8 3l4 5 4-5M8 8l4 13 4-13" />
    </template>
    <template v-else-if="name === 'ribbon'">
      <path d="M8 3c-3 0-5 2-5 4s2 4 5 4l4-4Z" />
      <path d="M16 3c3 0 5 2 5 4s-2 4-5 4l-4-4Z" />
      <circle cx="12" cy="7" r="3" />
      <path d="m9 10-2 11 5-3 5 3-2-11" />
    </template>
  </svg>
</template>
