import { describe, expect, it } from 'vitest'

import { atlasLocations, atlasTopicCount } from './atlas'
import { curriculumTopics } from './topics'

describe('curriculum atlas', () => {
  it('contains the complete ordered route', () => {
    const topics = atlasLocations.flatMap((location) => location.topics)

    expect(atlasLocations).toHaveLength(21)
    expect(atlasTopicCount).toBe(307)
    expect(topics.map((topic) => topic.order)).toEqual(
      Array.from({ length: 307 }, (_, index) => index + 1),
    )
    expect(new Set(topics.map((topic) => topic.id)).size).toBe(307)
  })

  it('links every 5–9 grade topic to exactly one atlas stop', () => {
    const curriculumIds = new Set(curriculumTopics.map((topic) => topic.id))
    const linkedLessonIds = atlasLocations
      .flatMap((location) => location.topics)
      .flatMap((topic) => (topic.liveTopicId ? [topic.liveTopicId] : []))

    expect(linkedLessonIds).toHaveLength(curriculumTopics.length)
    expect(new Set(linkedLessonIds).size).toBe(curriculumTopics.length)
    expect(new Set(linkedLessonIds)).toEqual(curriculumIds)
    expect(linkedLessonIds.every((topicId) => curriculumIds.has(topicId))).toBe(true)
  })
})
