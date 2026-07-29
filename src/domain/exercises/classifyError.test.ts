import { describe, expect, it } from 'vitest'

import { classifyExerciseError } from './classifyError'

describe('exercise error classification', () => {
  it('uses deterministic topic-specific rules', () => {
    expect(classifyExerciseError('2/5', '3/5', 'fraction-addition-equal')).toBe(
      'fractionRuleError',
    )
    expect(classifyExerciseError('14', '18', 'order-of-operations')).toBe(
      'operationOrderError',
    )
  })

  it('detects sign errors and avoids invented explanations', () => {
    expect(classifyExerciseError('5', '-5', 'negative-numbers')).toBe('signError')
    expect(classifyExerciseError('maybe', '5', 'natural-numbers')).toBe('unknown')
  })
})
