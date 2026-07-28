<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'

const route = useRoute()
const router = useRouter()

const copy = computed(() => {
  const feature = String(route.meta.feature)
  const variants = {
    diagnostic: {
      eyebrow: 'Адаптивний старт',
      title: 'Діагностика',
      text: 'Каркас маршруту готовий. Наступний навчальний інкремент додасть 12–20 відновлюваних завдань і побудову карти прогалин.',
    },
    review: {
      eyebrow: 'Повторення за розкладом',
      title: 'Черга повторення',
      text: 'Завершені вправи вже плануються на завтра. Інтерфейс змішаної review-сесії буде наступним вертикальним зрізом.',
    },
    mistakes: {
      eyebrow: 'Без сорому за помилки',
      title: 'Заплутані клубочки',
      text: 'Невдалі спроби вже мають тип помилки та зберігаються локально. Тут з’являться групи й схожі вправи.',
    },
    progress: {
      eyebrow: 'Лише чесні дані',
      title: 'Мій прогрес',
      text: 'Тут будуть хвилини навчання, засвоєні теми, точність повторень і тижнева активність — без вигаданого прогнозу бала НМТ.',
    },
    collection: {
      eyebrow: 'Нагороди за навчання',
      title: 'Колекція',
      text: 'Перша відзнака вже відкривається за завершений урок. Тут оселяться оригінальні стікери й прикраси столу.',
    },
    settings: {
      eyebrow: 'Дані під твоїм контролем',
      title: 'Налаштування',
      text: 'Експорт, відновлення, доступність і керування профілем будуть реалізовані після стабілізації навчального ядра.',
    },
  } as const

  return variants[feature as keyof typeof variants] ?? variants.progress
})
</script>

<template>
  <section class="preview-page page-shell">
    <MascotCard mood="thinking" compact />
    <div class="question-block question-block--center">
      <span class="eyebrow">{{ copy.eyebrow }}</span>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.text }}</p>
    </div>
    <BaseButton @click="router.push('/home')">Повернутися на головну</BaseButton>
  </section>
</template>
