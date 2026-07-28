import { describe, expect, it } from 'vitest'

import { updateMastery } from './updateMastery'

describe('mastery update', () => {
  it('rewards an independent answer more than a hinted answer', () => {
    const independent = updateMastery(30, {
      isCorrect: true,
      independent: true,
      hintLevelUsed: 0,
    })
    const hinted = updateMastery(30, {
      isCorrect: true,
      independent: true,
      hintLevelUsed: 1,
    })

    expect(independent.delta).toBeGreaterThan(hinted.delta)
  })

  it('never drops below zero or rises above one hundred', () => {
    expect(
      updateMastery(1, {
        isCorrect: false,
        independent: true,
        hintLevelUsed: 0,
      }).next,
    ).toBe(0)
    expect(
      updateMastery(99, {
        isCorrect: true,
        independent: true,
        hintLevelUsed: 0,
      }).next,
    ).toBe(100)
  })

  it('does not use speed as an input', () => {
    expect(
      updateMastery(60, {
        isCorrect: true,
        independent: true,
        hintLevelUsed: 0,
      }),
    ).toEqual({ previous: 60, next: 68, delta: 8 })
  })
})
