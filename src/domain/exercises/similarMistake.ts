import type { ExerciseAttempt } from '@/types/domain'

import { normalizeRational, parseRational, type Rational } from './rational'

export interface SimilarMistakeExercise {
  prompt: string
  expectedAnswer: string
  seed: string
}

function format(value: Rational): string {
  const normalized = normalizeRational(value)
  return normalized.denominator === 1n
    ? String(normalized.numerator)
    : `${normalized.numerator}/${normalized.denominator}`
}

function calculate(left: Rational, operation: string, right: Rational): Rational | undefined {
  switch (operation) {
    case '+':
      return {
        numerator: left.numerator * right.denominator + right.numerator * left.denominator,
        denominator: left.denominator * right.denominator,
      }
    case '-':
    case '−':
      return {
        numerator: left.numerator * right.denominator - right.numerator * left.denominator,
        denominator: left.denominator * right.denominator,
      }
    case '×':
      return {
        numerator: left.numerator * right.numerator,
        denominator: left.denominator * right.denominator,
      }
    case ':':
      if (right.numerator === 0n) return undefined
      return {
        numerator: left.numerator * right.denominator,
        denominator: left.denominator * right.numerator,
      }
    default:
      return undefined
  }
}

function seedNumber(seed: string): number {
  return [...seed].reduce((total, character) => total + character.charCodeAt(0), 0)
}

export function generateSimilarMistakeExercise(
  source: ExerciseAttempt,
  nonce: string = crypto.randomUUID(),
): SimilarMistakeExercise | undefined {
  if (!source.prompt || !source.expectedAnswer) return undefined
  const seed = `${source.seed}:similar:${nonce}`
  const delta = BigInt((seedNumber(seed) % 4) + 1)
  const match = source.prompt.match(/(-?\d+(?:\/\d+)?)\s*([+×:−-])\s*(-?\d+(?:\/\d+)?)/)
  if (match?.[1] && match[2] && match[3]) {
    const originalLeft = parseRational(match[1])
    const originalRight = parseRational(match[3])
    if (originalLeft && originalRight) {
      const left = normalizeRational({
        numerator: originalLeft.numerator + delta * originalLeft.denominator,
        denominator: originalLeft.denominator,
      })
      const right = normalizeRational({
        numerator: originalRight.numerator + delta * originalRight.denominator,
        denominator: originalRight.denominator,
      })
      const result = calculate(left, match[2], right)
      if (result) {
        return {
          prompt: source.prompt.replace(match[0], `${format(left)} ${match[2]} ${format(right)}`),
          expectedAnswer: format(result),
          seed,
        }
      }
    }
  }

  const expected = parseRational(source.expectedAnswer)
  if (!expected) return undefined
  const factor = delta + 1n
  return {
    prompt: `Скороти дріб ${expected.numerator * factor}/${expected.denominator * factor} до найпростішого вигляду.`,
    expectedAnswer: format(expected),
    seed,
  }
}
