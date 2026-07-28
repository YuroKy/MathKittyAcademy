<script setup lang="ts">
const props = defineProps<{
  items: Array<{ label: string; content: string }>
  modelValue: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  complete: []
}>()

function reveal(index: number): void {
  if (props.modelValue.includes(index)) return
  const next = [...props.modelValue, index].sort((left, right) => left - right)
  emit('update:modelValue', next)
  if (next.length === props.items.length) emit('complete')
}
</script>

<template>
  <section class="interaction-card tap-reveal" aria-labelledby="tap-reveal-title">
    <span class="interaction-card__label">Досліди ідею</span>
    <h2 id="tap-reveal-title">Відкрий три підказки теми</h2>
    <div class="tap-reveal__grid">
      <button
        v-for="(item, index) in items"
        :key="item.label"
        type="button"
        :class="{ revealed: modelValue.includes(index) }"
        :aria-expanded="modelValue.includes(index)"
        @click="reveal(index)"
      >
        <span aria-hidden="true">{{ modelValue.includes(index) ? '✦' : '?' }}</span>
        <strong>{{ item.label }}</strong>
        <small v-if="modelValue.includes(index)">{{ item.content }}</small>
        <small v-else>Натисни, щоб відкрити</small>
      </button>
    </div>
  </section>
</template>
