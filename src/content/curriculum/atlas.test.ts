import { describe, expect, it } from 'vitest'

import { atlasLocations, atlasTopicCount } from './atlas'
import { curriculumTopics } from './topics'

describe('curriculum atlas', () => {
  it('contains the complete ordered route', () => {
    const topics = atlasLocations.flatMap((location) => location.topics)

    expect(atlasLocations).toHaveLength(21)
    expect(atlasTopicCount).toBe(295)
    expect(topics.map((topic) => topic.order)).toEqual(
      Array.from({ length: 295 }, (_, index) => index + 1),
    )
    expect(new Set(topics.map((topic) => topic.id)).size).toBe(295)
  })

  it('links atlas stops only to existing interactive lessons', () => {
    const curriculumIds = new Set(curriculumTopics.map((topic) => topic.id))
    const linkedLessonIds = atlasLocations
      .flatMap((location) => location.topics)
      .flatMap((topic) => (topic.liveTopicId ? [topic.liveTopicId] : []))

    expect(linkedLessonIds).toHaveLength(15)
    expect(linkedLessonIds.every((topicId) => curriculumIds.has(topicId))).toBe(true)
  })
})
