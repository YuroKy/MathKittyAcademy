import { ref } from 'vue'

import {
  isAnswerEmpty,
  normalizeExerciseAnswer,
  snapshotExerciseAnswer,
  validateExerciseAnswer,
} from '@/domain/exercises/validateAnswer'
import { learningRepository } from '@/infrastructure/repositories/learningRepository'
import type { ExerciseAnswer, ExerciseInstance } from '@/types/domain'

export type ExerciseFeedback = 'correct' | 'incorrect' | 'revealed' | ''

interface SubmitInput {
  profileId: string
  sessionId: string
  exercise: ExerciseInstance
  answer: ExerciseAnswer
  hintLevel: number
  reveal?: boolean
}

export function useExerciseSubmission() {
  const saving = ref(false)
  const feedback = ref<ExerciseFeedback>('')
  const errorMessage = ref('')

  async function submit(input: SubmitInput): Promise<ExerciseFeedback | undefined> {
    if (saving.value || (!input.reveal && isAnswerEmpty(input.answer))) return undefined
    saving.value = true
    errorMessage.value = ''
    try {
      const normalized = input.reveal ? '' : normalizeExerciseAnswer(input.answer)
      const isCorrect =
        !input.reveal && validateExerciseAnswer(input.exercise, normalized)
      await learningRepository.recordAttempt({
        profileId: input.profileId,
        sessionId: input.sessionId,
        exerciseId: input.exercise.id,
        templateId: input.exercise.templateId,
        seed: input.exercise.seed,
        topicId: input.exercise.topicId,
        skillIds: input.exercise.skillIds,
        prompt: input.exercise.prompt,
        expectedAnswer: input.exercise.expectedAnswer,
        submittedAnswer: input.reveal ? 'Не знаю' : snapshotExerciseAnswer(input.answer),
        normalizedAnswer: normalized,
        isCorrect,
        hintLevelUsed: input.reveal ? Math.max(2, input.hintLevel) : input.hintLevel,
      })
      feedback.value = input.reveal ? 'revealed' : isCorrect ? 'correct' : 'incorrect'
      return feedback.value
    } catch (error) {
      console.error('Failed to save exercise attempt', error)
      errorMessage.value = 'Відповідь не збереглася. Спробуй ще раз перед переходом далі.'
      return undefined
    } finally {
      saving.value = false
    }
  }

  function reset(): void {
    saving.value = false
    feedback.value = ''
    errorMessage.value = ''
  }

  return { saving, feedback, errorMessage, submit, reset }
}
