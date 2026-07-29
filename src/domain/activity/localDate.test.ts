import { describe, expect, it } from 'vitest'

import { calendarDayDistance, localDateKey } from './localDate'

describe('local activity dates', () => {
  it('formats a date using local calendar fields', () => {
    expect(localDateKey(new Date(2026, 6, 9, 23, 59))).toBe('2026-07-09')
  })

  it('counts calendar days without DST duration assumptions', () => {
    expect(calendarDayDistance('2026-03-28', '2026-03-29')).toBe(1)
    expect(calendarDayDistance('2026-12-31', '2027-01-01')).toBe(1)
    expect(calendarDayDistance('2026-07-01', '2026-07-03')).toBe(2)
  })
})
