<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const offline = ref(!navigator.onLine)

function updateStatus(): void {
  offline.value = !navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>

<template>
  <div v-if="offline" class="offline-indicator" role="status">
    <span aria-hidden="true">☁</span>
    Офлайн — прогрес усе одно зберігається
  </div>
</template>
