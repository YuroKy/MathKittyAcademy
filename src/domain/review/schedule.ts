import { appConfig } from '@/content/config'

export function scheduleNextReview(
  from: Date,
  intervalStep: number,
  result: 'correct' | 'incorrect',
): { intervalStep: number; dueAt: string } {
  const nextStep =
    result === 'incorrect'
      ? 0
      : Math.min(intervalStep + 1, appConfig.reviewIntervalsDays.length - 1)
  const days =
    result === 'incorrect'
      ? appConfig.reviewIntervalsDays[0]
      : appConfig.reviewIntervalsDays[Math.min(intervalStep, appConfig.reviewIntervalsDays.length - 1)]

  if (days === undefined) {
    throw new Error('Не налаштовано інтервал повторення.')
  }

  const due = new Date(from)
  due.setDate(due.getDate() + days)
  return { intervalStep: nextStep, dueAt: due.toISOString() }
}
