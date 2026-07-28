<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    groups?: number
    perGroup?: number
    modelValue: number[]
  }>(),
  {
    groups: 3,
    perGroup: 4,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  complete: []
}>()

const total = computed(() => props.modelValue.reduce((sum, count) => sum + count, 0))
const target = computed(() => props.groups * props.perGroup)
const complete = computed(() => total.value === target.value)

function addToGroup(index: number): void {
  if ((props.modelValue[index] ?? 0) >= props.perGroup) return
  const next = Array.from({ length: props.groups }, (_, groupIndex) =>
    groupIndex === index
      ? Math.min((props.modelValue[groupIndex] ?? 0) + 1, props.perGroup)
      : (props.modelValue[groupIndex] ?? 0),
  )
  emit('update:modelValue', next)
  if (next.reduce((sum, count) => sum + count, 0) === target.value) emit('complete')
}
</script>

<template>
  <section class="interaction-card grouping-board" aria-labelledby="grouping-title">
    <span class="interaction-card__label">Торкнися груп</span>
    <h2 id="grouping-title">Збери {{ groups }} групи по {{ perGroup }}</h2>
    <p>Натискай на коробки, доки в кожній не буде по {{ perGroup }} олівці.</p>
    <div class="grouping-board__groups">
      <button
        v-for="groupIndex in groups"
        :key="groupIndex"
        type="button"
        class="group-box"
        :aria-label="`Група ${groupIndex}: ${modelValue[groupIndex - 1] ?? 0} із ${perGroup}`"
        :disabled="(modelValue[groupIndex - 1] ?? 0) >= perGroup"
        @click="addToGroup(groupIndex - 1)"
      >
        <span class="group-box__number">{{ groupIndex }}</span>
        <span class="pencil-stack" aria-hidden="true">
          <span
            v-for="pencil in modelValue[groupIndex - 1] ?? 0"
            :key="pencil"
            class="mini-pencil"
          />
        </span>
        <small>
          {{
            (modelValue[groupIndex - 1] ?? 0) >= perGroup
              ? 'готово'
              : `+ додати (${modelValue[groupIndex - 1] ?? 0}/${perGroup})`
          }}
        </small>
      </button>
    </div>
    <div :class="['interaction-result', { 'interaction-result--complete': complete }]">
      <span>{{ total }}</span>
      <p>
        <strong>{{
          complete ? `${groups} × ${perGroup} = ${target}` : `Зібрано ${total} із ${target}`
        }}</strong>
        {{ complete ? 'Ти щойно побудувала множення власноруч.' : 'Продовжуй наповнювати групи.' }}
      </p>
    </div>
  </section>
</template>
