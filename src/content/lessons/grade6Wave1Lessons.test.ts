import { describe, expect, it } from 'vitest'

import { curriculumTopics } from '@/content/curriculum/topics'
import { buildLessonExerciseSet } from '@/domain/exercises/generator'
import { validateExerciseAnswer } from '@/domain/exercises/validateAnswer'
import type { AnswerSpec, ExerciseAnswer } from '@/types/domain'

import { grade6Wave1Lessons } from './grade6Wave1Lessons'
import { grade6Wave1Qa, grade6Wave1TopicIds } from './grade6Wave1Qa'

function correctAnswer(spec: AnswerSpec | undefined, fallback: string): ExerciseAnswer {
  if (!spec) return fallback
  switch (spec.kind) {
    case 'rational':
    case 'exact':
    case 'singleChoice':
      return spec.value
    case 'decimalTolerance':
      return String(spec.value)
    case 'multipleChoice':
      return [...spec.values].reverse()
    case 'matching':
      return { ...spec.pairs }
    case 'stepByStep':
      return spec.steps.map((step) => step.value)
  }
}

describe('grade 6 wave 1 lessons', () => {
  it('covers exactly the seven scoped curriculum topics with triple QA approval', () => {
    expect(Object.keys(grade6Wave1Lessons).sort()).toEqual([...grade6Wave1TopicIds].sort())
    for (const topicId of grade6Wave1TopicIds) {
      expect(curriculumTopics.some((topic) => topic.id === topicId && topic.gradeLevels.includes(6))).toBe(true)
      expect(grade6Wave1Qa[topicId]).toEqual({
        mathApproved: true,
        languageApproved: true,
        pedagogyApproved: true,
      })
    }
  })

  it('has complete metadata, unique ids and checkable answers', () => {
    const ids = new Set<string>()
    for (const [topicId, lesson] of Object.entries(grade6Wave1Lessons)) {
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(3)
      expect(lesson.guidedSteps.length).toBeGreaterThanOrEqual(3)
      expect(lesson.explorationItems.length).toBeGreaterThanOrEqual(3)
      for (const template of lesson.exercises) {
        expect(ids.has(template.templateId)).toBe(false)
        ids.add(template.templateId)
        expect(template.hints.length).toBeGreaterThanOrEqual(2)
        expect(template.simplerExplanation?.length).toBeGreaterThan(10)
        expect(template.solutionSteps.length).toBeGreaterThanOrEqual(2)
        const [exercise] = buildLessonExerciseSet(
          { ...lesson, exercises: [template] },
          'deterministic-session',
        )
        expect(exercise?.topicId).toBe(topicId)
        expect(
          exercise && validateExerciseAnswer(
            exercise,
            correctAnswer(exercise.answerSpec, exercise.expectedAnswer),
          ),
          template.templateId,
        ).toBe(true)
      }
    }
  })

  it('builds deterministic exercise snapshots for a stable session seed', () => {
    for (const lesson of Object.values(grade6Wave1Lessons)) {
      expect(buildLessonExerciseSet(lesson, 'same-session')).toEqual(
        buildLessonExerciseSet(lesson, 'same-session'),
      )
    }
  })
})
