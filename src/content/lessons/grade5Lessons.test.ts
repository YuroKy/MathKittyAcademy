import { describe, expect, it } from 'vitest'

import { curriculumTopics } from '@/content/curriculum/topics'
import { parseRational } from '@/domain/exercises/rational'

import { grade5Lessons, grade5TopicIds } from './grade5Lessons'

describe('grade 5 full lessons', () => {
  it('covers every grade 5 topic and no unrelated topic', () => {
    const curriculumIds = curriculumTopics
      .filter((topic) => topic.gradeLevels.includes(5))
      .map((topic) => topic.id)
      .sort()

    expect([...grade5TopicIds].sort()).toEqual(curriculumIds)
    expect(Object.keys(grade5Lessons).sort()).toEqual(curriculumIds)
  })

  it('provides a complete authored learning flow for every topic', () => {
    const topicById = new Map(curriculumTopics.map((topic) => [topic.id, topic]))

    for (const [topicId, lesson] of Object.entries(grade5Lessons)) {
      const topic = topicById.get(topicId)

      expect(topic, `${topicId} must exist in the curriculum`).toBeDefined()
      expect(lesson.topicId).toBe(topicId)
      expect(lesson.preview.topicId).toBe(topicId)
      expect(lesson.preview.choices).toHaveLength(3)
      expect(lesson.preview.correctChoiceIndex).toBeGreaterThanOrEqual(0)
      expect(lesson.preview.correctChoiceIndex).toBeLessThan(lesson.preview.choices.length)
      expect(lesson.introTitle.length).toBeGreaterThan(10)
      expect(lesson.introText.length).toBeGreaterThan(30)
      expect(lesson.explorationItems).toHaveLength(3)
      expect(lesson.guidedSteps.length).toBeGreaterThanOrEqual(3)
      expect(lesson.exercises).toHaveLength(3)

      for (const exercise of lesson.exercises) {
        expect(exercise.title.length, `${exercise.templateId} title`).toBeGreaterThan(5)
        expect(exercise.prompt.length, `${exercise.templateId} prompt`).toBeGreaterThan(4)
        expect(exercise.hints.length, `${exercise.templateId} hints`).toBeGreaterThanOrEqual(2)
        expect(
          exercise.solutionSteps.length,
          `${exercise.templateId} solution steps`,
        ).toBeGreaterThanOrEqual(2)
        expect(
          parseRational(exercise.expectedAnswer),
          `${exercise.templateId} expected answer must be checkable`,
        ).not.toBeNull()
        expect(
          exercise.skillIds.every((skillId) => topic!.skillIds.includes(skillId)),
          `${exercise.templateId} skills must belong to ${topicId}`,
        ).toBe(true)
      }
    }
  })

  it('keeps exercise template ids unique across the grade', () => {
    const templateIds = Object.values(grade5Lessons).flatMap((lesson) =>
      lesson.exercises.map((exercise) => exercise.templateId),
    )

    expect(new Set(templateIds).size).toBe(templateIds.length)
  })
})
