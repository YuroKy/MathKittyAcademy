import { describe, expect, it } from 'vitest'

import { areEquivalentAnswers, normalizeRational, parseRational } from './rational'

describe('rational answers', () => {
  it('normalizes signs and common factors', () => {
    expect(normalizeRational({ numerator: -6n, denominator: -8n })).toEqual({
      numerator: 3n,
      denominator: 4n,
    })
  })

  it('accepts equivalent simplified and unsimplified fractions', () => {
    expect(areEquivalentAnswers('2/4', '1/2')).toBe(true)
    expect(areEquivalentAnswers('-3/6', '-1/2')).toBe(true)
  })

  it('accepts comma and dot decimal separators without float equality', () => {
    expect(areEquivalentAnswers('0,50', '1/2')).toBe(true)
    expect(areEquivalentAnswers('0.125', '1/8')).toBe(true)
  })

  it('rejects invalid and zero-denominator values', () => {
    expect(parseRational('1/0')).toBeNull()
    expect(parseRational('три')).toBeNull()
    expect(areEquivalentAnswers('1/0', '0')).toBe(false)
  })
})
