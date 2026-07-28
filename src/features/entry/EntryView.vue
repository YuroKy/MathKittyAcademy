<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()

onMounted(async () => {
  await profileStore.initialize()
  if (profileStore.activeProfile) {
    await router.replace('/home')
  } else if (profileStore.hasProfiles) {
    await router.replace('/profiles')
  } else {
    await router.replace('/welcome')
  }
})
</script>

<template>
  <div class="loading-state" role="status">Відкриваємо двері академії…</div>
</template>
