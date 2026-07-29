import type { ErrorType } from '@/types/domain'

export function classifyExerciseError(
  actual: string,
  expected: string,
  topicId: string,
): ErrorType {
  const normalizedActual = actual.trim().replace(',', '.')
  const normalizedExpected = expected.trim().replace(',', '.')
  if (!normalizedActual) return 'unknown'
  if (normalizedActual === normalizedExpected) return 'inputMistake'
  if (topicId.includes('fraction')) return 'fractionRuleError'
  if (topicId.includes('order-of-operations')) return 'operationOrderError'
  if (
    (normalizedExpected.startsWith('-') && !normalizedActual.startsWith('-')) ||
    (!normalizedExpected.startsWith('-') && normalizedActual.startsWith('-'))
  ) {
    return 'signError'
  }
  if (/^-?\d+([./]\d+)?$/.test(normalizedActual)) return 'calculationError'
  return 'unknown'
}

export const errorExplanationKeys: Record<ErrorType, string> = {
  conceptMisunderstanding: 'concept',
  calculationError: 'calculation',
  signError: 'sign',
  operationOrderError: 'operation-order',
  fractionRuleError: 'fraction-rule',
  conditionMisread: 'condition',
  inputMistake: 'input',
  unknown: 'unknown',
}
