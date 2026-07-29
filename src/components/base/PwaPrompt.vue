<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'

import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const canRefresh = computed(
  () => !['lesson', 'review', 'diagnostic'].includes(String(route.name)),
)
const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
  onRegisterError(error) {
    console.error('Service worker registration failed', error)
  },
})

function close(): void {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <aside v-if="offlineReady || needRefresh" class="pwa-prompt" role="status">
    <div>
      <strong>{{ offlineReady ? 'Академія готова до офлайн-роботи' : 'Є нова версія' }}</strong>
      <p>
        {{
          offlineReady
            ? 'Після першого завантаження заняття доступні без інтернету.'
            : 'Онови застосунок, коли завершиш поточне завдання.'
        }}
      </p>
    </div>
    <div class="pwa-prompt__actions">
      <BaseButton v-if="needRefresh && canRefresh" @click="updateServiceWorker(true)">Оновити</BaseButton>
      <span v-else-if="needRefresh">Оновлення зачекає до завершення вправи.</span>
      <BaseButton variant="ghost" @click="close">Пізніше</BaseButton>
    </div>
  </aside>
</template>
