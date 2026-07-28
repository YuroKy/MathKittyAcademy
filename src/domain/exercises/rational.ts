export interface Rational {
  numerator: bigint
  denominator: bigint
}

function greatestCommonDivisor(left: bigint, right: bigint): bigint {
  let a = left < 0n ? -left : left
  let b = right < 0n ? -right : right

  while (b !== 0n) {
    const remainder = a % b
    a = b
    b = remainder
  }

  return a
}

export function normalizeRational(value: Rational): Rational {
  if (value.denominator === 0n) {
    throw new Error('Знаменник не може бути нулем.')
  }

  const sign = value.denominator < 0n ? -1n : 1n
  const numerator = value.numerator * sign
  const denominator = value.denominator * sign
  const divisor = greatestCommonDivisor(numerator, denominator)

  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  }
}

export function parseRational(raw: string): Rational | null {
  const normalized = raw.trim().replace(',', '.').replace(/\s+/g, '')

  if (/^[+-]?\d+\/[+-]?\d+$/.test(normalized)) {
    const [numeratorRaw, denominatorRaw] = normalized.split('/')
    if (numeratorRaw === undefined || denominatorRaw === undefined) return null

    const denominator = BigInt(denominatorRaw)
    if (denominator === 0n) return null
    return normalizeRational({
      numerator: BigInt(numeratorRaw),
      denominator,
    })
  }

  if (/^[+-]?\d+(\.\d+)?$/.test(normalized)) {
    const [integerPart = '0', fractionPart = ''] = normalized.split('.')
    const scale = 10n ** BigInt(fractionPart.length)
    const absoluteInteger = integerPart.replace(/^[+-]/, '')
    const sign = integerPart.startsWith('-') ? -1n : 1n
    return normalizeRational({
      numerator: sign * BigInt(`${absoluteInteger}${fractionPart}`),
      denominator: scale,
    })
  }

  return null
}

export function areEquivalentAnswers(actual: string, expected: string): boolean {
  const actualRational = parseRational(actual)
  const expectedRational = parseRational(expected)

  return (
    actualRational !== null &&
    expectedRational !== null &&
    actualRational.numerator === expectedRational.numerator &&
    actualRational.denominator === expectedRational.denominator
  )
}
