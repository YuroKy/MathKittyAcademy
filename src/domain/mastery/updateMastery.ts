export interface MasteryAttempt {
  isCorrect: boolean
  hintLevelUsed: number
  independent: boolean
}

export interface MasteryUpdate {
  previous: number
  next: number
  delta: number
}

export function updateMastery(previous: number, attempt: MasteryAttempt): MasteryUpdate {
  const safePrevious = Math.min(100, Math.max(0, Math.round(previous)))
  let delta: number

  if (!attempt.isCorrect) {
    delta = safePrevious >= 80 ? -8 : safePrevious >= 40 ? -5 : -2
  } else if (!attempt.independent) {
    delta = 2
  } else if (attempt.hintLevelUsed === 0) {
    delta = safePrevious < 60 ? 12 : safePrevious < 80 ? 8 : 4
  } else if (attempt.hintLevelUsed === 1) {
    delta = safePrevious < 60 ? 7 : 4
  } else {
    delta = 3
  }

  const next = Math.min(100, Math.max(0, safePrevious + delta))
  return { previous: safePrevious, next, delta: next - safePrevious }
}
