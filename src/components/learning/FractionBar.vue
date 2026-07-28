<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    parts?: number
    target?: number
    modelValue: number[]
  }>(),
  {
    parts: 6,
    target: 3,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  complete: []
}>()

const complete = computed(() => props.modelValue.length === props.target)

function togglePart(index: number): void {
  const selected = props.modelValue.includes(index)
  if (!selected && props.modelValue.length >= props.target) return

  const next = selected
    ? props.modelValue.filter((part) => part !== index)
    : [...props.modelValue, index].sort((left, right) => left - right)
  emit('update:modelValue', next)
  if (next.length === props.target) emit('complete')
}
</script>

<template>
  <section class="interaction-card fraction-board" aria-labelledby="fraction-title">
    <span class="interaction-card__label">Побудуй дріб</span>
    <h2 id="fraction-title">Зафарбуй {{ target }} із {{ parts }} рівних частин</h2>
    <p>Кожна клітинка — одна чесна рівна частина цілого.</p>
    <div class="fraction-strip" :style="{ gridTemplateColumns: `repeat(${parts}, 1fr)` }">
      <button
        v-for="part in parts"
        :key="part"
        type="button"
        :class="['fraction-part', { 'fraction-part--selected': modelValue.includes(part - 1) }]"
        :aria-label="`Частина ${part} з ${parts}`"
        :aria-pressed="modelValue.includes(part - 1)"
        @click="togglePart(part - 1)"
      >
        <span aria-hidden="true">{{ modelValue.includes(part - 1) ? '♥' : part }}</span>
      </button>
    </div>
    <div :class="['interaction-result', { 'interaction-result--complete': complete }]">
      <span>{{ modelValue.length }}/{{ parts }}</span>
      <p>
        <strong>{{ complete ? 'Дріб побудовано!' : `Обрано ${modelValue.length} частини` }}</strong>
        {{
          complete
            ? `${target} — чисельник, ${parts} — знаменник.`
            : `Потрібно обрати рівно ${target}.`
        }}
      </p>
    </div>
  </section>
</template>
