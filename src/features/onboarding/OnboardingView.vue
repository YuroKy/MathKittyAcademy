<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppIcon from '@/components/base/AppIcon.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ProgressBar from '@/components/base/ProgressBar.vue'
import MascotCard from '@/components/mascot/MascotCard.vue'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()
const step = ref(0)
const saving = ref(false)
const errorMessage = ref('')
const form = reactive({
  name: '',
  examDate: '',
  weeklyFrequency: 3,
  dailyGoalMinutes: 10 as 10 | 15 | 20,
  avatarId: 'murka-blue-heart',
})

const totalSteps = 6
const progress = computed(() => ((step.value + 1) / totalSteps) * 100)
const canContinue = computed(() => step.value !== 0 || form.name.trim().length >= 2)

function next(): void {
  if (!canContinue.value || step.value >= totalSteps - 1) return
  step.value += 1
}

function previous(): void {
  if (step.value > 0) step.value -= 1
  else router.push('/welcome')
}

async function finish(): Promise<void> {
  saving.value = true
  errorMessage.value = ''

  try {
    const dayPatterns: Record<number, number[]> = {
      2: [2, 6],
      3: [1, 3, 5],
      4: [1, 2, 4, 6],
      5: [1, 2, 3, 5, 6],
      6: [1, 2, 3, 4, 5, 6],
      7: [0, 1, 2, 3, 4, 5, 6],
    }

    await profileStore.createProfile({
      name: form.name,
      avatarId: form.avatarId,
      dailyGoalMinutes: form.dailyGoalMinutes,
      preferredStudyDays: dayPatterns[form.weeklyFrequency] ?? [1, 3, 5],
      ...(form.examDate ? { examDate: form.examDate } : {}),
    })
    await router.push('/home')
  } catch (error) {
    console.error('Failed to create profile', error)
    errorMessage.value = 'Профіль не зберігся. Спробуй ще раз — введені відповіді залишилися тут.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="onboarding-page page-shell">
    <header class="onboarding-header">
      <button class="icon-button" type="button" aria-label="Назад" @click="previous">←</button>
      <ProgressBar :value="progress" label="Прогрес налаштування профілю" />
      <span class="onboarding-step">{{ step + 1 }}/{{ totalSteps }}</span>
    </header>

    <div class="onboarding-card">
      <template v-if="step === 0">
        <MascotCard mood="neutral" compact />
        <div class="question-block">
          <span class="eyebrow">Познайомимося</span>
          <h1>Як до тебе звертатися?</h1>
          <p>Ім’я буде видно лише у твоєму локальному профілі.</p>
          <label class="field">
            <span>Твоє ім’я</span>
            <input
              v-model="form.name"
              type="text"
              autocomplete="nickname"
              maxlength="40"
              placeholder="Наприклад, Марта"
              autofocus
              @keyup.enter="next"
            />
          </label>
        </div>
      </template>

      <template v-else-if="step === 1">
        <MascotCard mood="thinking" compact />
        <div class="question-block">
          <span class="eyebrow">Орієнтир</span>
          <h1>Коли приблизно буде НМТ?</h1>
          <p>Дата допоможе спланувати темп. Її можна додати або змінити пізніше.</p>
          <label class="field">
            <span>Орієнтовна дата</span>
            <input v-model="form.examDate" type="date" />
          </label>
          <button class="text-button" type="button" @click="form.examDate = ''; next()">
            Поки не знаю
          </button>
        </div>
      </template>

      <template v-else-if="step === 2">
        <MascotCard mood="encouraging" compact />
        <div class="question-block">
          <span class="eyebrow">Ритм без тиску</span>
          <h1>Скільки днів на тиждень зручно вчитися?</h1>
          <p>Радимо почати з трьох коротких занять.</p>
          <div class="choice-grid choice-grid--numbers">
            <button
              v-for="frequency in [2, 3, 4, 5, 6, 7]"
              :key="frequency"
              type="button"
              :class="{ selected: form.weeklyFrequency === frequency }"
              @click="form.weeklyFrequency = frequency"
            >
              <strong>{{ frequency }}</strong>
              <span>дні</span>
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="step === 3">
        <MascotCard mood="neutral" compact />
        <div class="question-block">
          <span class="eyebrow">Маленький крок</span>
          <h1>Скільки хвилин на одне заняття?</h1>
          <p>Навіть 10 хвилин — достатньо для стабільного прогресу.</p>
          <div class="choice-grid">
            <button
              v-for="minutes in ([10, 15, 20] as const)"
              :key="minutes"
              type="button"
              :class="{ selected: form.dailyGoalMinutes === minutes }"
              @click="form.dailyGoalMinutes = minutes"
            >
              <strong>{{ minutes }}</strong>
              <span>хвилин</span>
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="step === 4">
        <MascotCard mood="celebrating" compact />
        <div class="question-block">
          <span class="eyebrow">Твоя напарниця</span>
          <h1>Обери аксесуар для Мурки</h1>
          <p>Це оригінальна киця академії. Нові прикраси з’являться за навчання.</p>
          <div class="choice-grid">
            <button
              v-for="avatar in [
                { id: 'murka-blue-heart', icon: 'heart' as const, label: 'Блакитне серце' },
                { id: 'murka-gold-star', icon: 'star' as const, label: 'Золота зірка' },
                { id: 'murka-pink-scarf', icon: 'ribbon' as const, label: 'Рожевий бантик' },
              ]"
              :key="avatar.id"
              type="button"
              :class="{ selected: form.avatarId === avatar.id }"
              @click="form.avatarId = avatar.id"
            >
              <strong aria-hidden="true"><AppIcon :name="avatar.icon" /></strong>
              <span>{{ avatar.label }}</span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <MascotCard
          mood="encouraging"
          :message="`${form.name}, усе готово. Діагностика — не іспит: вона лише знайде комфортну точку старту.`"
        />
        <div class="question-block question-block--center">
          <span class="eyebrow">Готово до першого кроку</span>
          <h1>Почнемо з основ</h1>
          <p>
            Поки повна діагностика готується, можна пройти перше коротке заняття й
            перевірити, як усе працює.
          </p>
        </div>
      </template>

      <p v-if="errorMessage" class="inline-error" role="alert">{{ errorMessage }}</p>

      <footer class="onboarding-actions">
        <BaseButton variant="ghost" @click="previous">Назад</BaseButton>
        <BaseButton
          v-if="step < totalSteps - 1"
          :disabled="!canContinue"
          @click="next"
        >
          Продовжити
        </BaseButton>
        <BaseButton v-else :disabled="saving" @click="finish">
          {{ saving ? 'Зберігаємо…' : 'Увійти до академії' }}
        </BaseButton>
      </footer>
    </div>
  </section>
</template>
