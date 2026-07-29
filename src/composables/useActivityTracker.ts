import { onBeforeUnmount, onMounted } from 'vue'

import { activityRepository } from '@/infrastructure/repositories/activityRepository'

export function useActivityTracker(profileId: () => string | undefined): void {
  let lastActiveAt = 0
  let lastInteractionAt = 0
  let timer: number | undefined

  function flush(): void {
    const id = profileId()
    if (!id || document.hidden || !lastActiveAt) return
    const now = Date.now()
    if (now - lastInteractionAt >= 90_000) {
      lastActiveAt = 0
      return
    }
    const seconds = Math.min(30, Math.max(0, (now - lastActiveAt) / 1000))
    lastActiveAt = now
    if (seconds >= 1) void activityRepository.addActiveSeconds(id, seconds)
  }

  function visibilityChanged(): void {
    if (document.hidden) {
      flush()
      lastActiveAt = 0
    } else {
      lastActiveAt = Date.now()
      lastInteractionAt = lastActiveAt
    }
  }

  function registerInteraction(): void {
    lastInteractionAt = Date.now()
    if (!document.hidden && !lastActiveAt) lastActiveAt = lastInteractionAt
  }

  onMounted(() => {
    lastActiveAt = document.hidden ? 0 : Date.now()
    lastInteractionAt = lastActiveAt
    timer = window.setInterval(flush, 30_000)
    document.addEventListener('visibilitychange', visibilityChanged)
    window.addEventListener('pointerdown', registerInteraction, { passive: true })
    window.addEventListener('keydown', registerInteraction)
    window.addEventListener('touchstart', registerInteraction, { passive: true })
    window.addEventListener('pagehide', flush)
  })

  onBeforeUnmount(() => {
    flush()
    if (timer !== undefined) window.clearInterval(timer)
    document.removeEventListener('visibilitychange', visibilityChanged)
    window.removeEventListener('pointerdown', registerInteraction)
    window.removeEventListener('keydown', registerInteraction)
    window.removeEventListener('touchstart', registerInteraction)
    window.removeEventListener('pagehide', flush)
  })
}
