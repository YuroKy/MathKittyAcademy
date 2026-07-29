import { describe, expect, it } from 'vitest'

import { atlasLocations } from '@/content/curriculum/atlas'
import { curriculumTopics } from '@/content/curriculum/topics'
import { parseRational } from '@/domain/exercises/rational'

import { elementaryLessons, elementaryTopicIds, elementaryTopicSeeds } from './elementaryLessons'
import { findFullLesson } from './fullLessons'

describe('elementary curriculum and lessons', () => {
  it('covers every previously planned atlas stop for grades 1–4', () => {
    const elementaryStops = atlasLocations.slice(0, 5).flatMap((location) => location.topics)
    const linkedTopicIds = elementaryStops.flatMap((topic) =>
      topic.liveTopicId ? [topic.liveTopicId] : [],
    )

    expect(elementaryStops).toHaveLength(62)
    expect(linkedTopicIds).toHaveLength(62)
    expect(linkedTopicIds.every((topicId) => findFullLesson(topicId))).toBe(true)
  })

  it('adds complete metadata for every new elementary topic', () => {
    expect(elementaryTopicIds).toHaveLength(55)
    expect(elementaryTopicSeeds).toHaveLength(55)

    for (const topicId of elementaryTopicIds) {
      const topic = curriculumTopics.find((entry) => entry.id === topicId)
      expect(topic, topicId).toBeDefined()
      expect(topic!.gradeLevels.every((grade) => grade >= 1 && grade <= 4)).toBe(true)
      expect(topic!.subtopics.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('provides a complete, checkable lesson flow for every new topic', () => {
    for (const [topicId, lesson] of Object.entries(elementaryLessons)) {
      expect(lesson.topicId).toBe(topicId)
      expect(lesson.preview.topicId).toBe(topicId)
      expect(lesson.preview.choices).toHaveLength(3)
      expect(lesson.explorationItems).toHaveLength(3)
      expect(lesson.guidedSteps.length).toBeGreaterThanOrEqual(3)
      expect(lesson.exercises).toHaveLength(3)

      for (const exercise of lesson.exercises) {
        expect(exercise.hints.length).toBeGreaterThanOrEqual(2)
        expect(exercise.solutionSteps.length).toBeGreaterThanOrEqual(2)
        expect(parseRational(exercise.expectedAnswer), exercise.templateId).not.toBeNull()
      }
    }
  })
})
