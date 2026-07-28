<script setup lang="ts">
import type { SchoolGrade } from '@/types/domain'

withDefaults(
  defineProps<{
    tags: readonly string[]
    gradeLevels: readonly SchoolGrade[]
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)
</script>

<template>
  <div
    v-if="tags.length || gradeLevels.length"
    :class="['content-tags', { 'content-tags--compact': compact }]"
    aria-label="Теги навчального матеріалу"
    role="list"
  >
    <span
      v-for="grade in gradeLevels"
      :key="`grade-${grade}`"
      class="content-tag content-tag--grade"
      role="listitem"
    >
      {{ grade }} клас
    </span>
    <span
      v-for="tag in tags"
      :key="`topic-${tag}`"
      class="content-tag content-tag--topic"
      role="listitem"
    >
      {{ tag }}
    </span>
  </div>
</template>
