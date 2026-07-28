import { describe, expect, it } from 'vitest'

import { curriculumTopics } from './topics'

describe('curriculum topic metadata', () => {
  it('provides unique tags and at least one school grade for every live topic', () => {
    for (const topic of curriculumTopics) {
      expect(topic.tags.length, `${topic.id} must have tags`).toBeGreaterThan(0)
      expect(new Set(topic.tags).size, `${topic.id} tags must be unique`).toBe(topic.tags.length)
      expect(topic.gradeLevels.length, `${topic.id} must have grades`).toBeGreaterThan(0)
      expect(
        topic.gradeLevels.every((grade) => Number.isInteger(grade) && grade >= 1 && grade <= 12),
        `${topic.id} grades must be valid`,
      ).toBe(true)
    }
  })
})
