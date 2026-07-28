import { describe, expect, it } from 'vitest'

import { scheduleNextReview } from './schedule'

describe('review schedule', () => {
  const start = new Date('2026-07-28T12:00:00.000Z')

  it('schedules the first successful review for the next day', () => {
    const result = scheduleNextReview(start, 0, 'correct')
    expect(result.intervalStep).toBe(1)
    expect(result.dueAt).toBe('2026-07-29T12:00:00.000Z')
  })

  it('returns a failed review to the next-day interval', () => {
    const result = scheduleNextReview(start, 3, 'incorrect')
    expect(result.intervalStep).toBe(0)
    expect(result.dueAt).toBe('2026-07-29T12:00:00.000Z')
  })
})
