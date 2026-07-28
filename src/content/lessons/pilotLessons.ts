import type { PilotLessonContent } from '@/types/domain'

export const pilotLessons: Record<PilotLessonContent['topicId'], PilotLessonContent> = {
  'natural-numbers': {
    topicId: 'natural-numbers',
    introTitle: 'Числа стають зрозумілими, коли їх можна торкнутися',
    introText:
      'Сьогодні не будемо просто читати правила. Зберемо однакові групи, передбачимо дію й самі завершимо розв’язання.',
    mascotMessage: 'Я триматиму рахунок, а ти керуватимеш числами.',
    interactionKind: 'groupingBoard',
    guidedTitle: 'Розкладемо 27 + 16 на зручні кроки',
    guidedSteps: [
      'Розкладаємо 16 на 10 і 6.',
      'Додаємо десяток: 27 + 10 = 37.',
      'Додаємо решту: 37 + 6 = 43.',
    ],
    summaryText:
      'Ти використала додавання, віднімання й множення як інструменти, а не як окремі правила.',
  },
  'fraction-meaning': {
    topicId: 'fraction-meaning',
    introTitle: 'Дріб — це частина, яку можна побачити',
    introText:
      'Поділимо смужку на рівні частини, зафарбуємо потрібну кількість і самі складемо запис дробу.',
    mascotMessage: 'Я принесла шоколадну плитку. Ділимо тільки на чесні рівні частини!',
    interactionKind: 'fractionBar',
    guidedTitle: 'Як прочитати 3/6',
    guidedSteps: [
      'Рахуємо всі рівні частини: їх 6, це знаменник.',
      'Рахуємо зафарбовані частини: їх 3, це чисельник.',
      'Записуємо 3/6 і бачимо, що це половина смужки.',
    ],
    summaryText:
      'Тепер чисельник і знаменник пов’язані з реальною моделлю, а не висять у повітрі.',
  },
}

export function findPilotLesson(topicId: string): PilotLessonContent | undefined {
  if (topicId === 'natural-numbers' || topicId === 'fraction-meaning') {
    return pilotLessons[topicId]
  }
  return undefined
}
