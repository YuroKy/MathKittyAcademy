import { describe, expect, it } from 'vitest'

import { topicPreviews } from '@/content/lessons/topicPreviews'
import type { SchoolGrade } from '@/types/domain'

import { curriculumTopics } from './topics'

describe('curriculum topic metadata', () => {
  it('covers every grade from 5 through 9 with the expected topic set', () => {
    const expectedTopicCountByGrade = new Map<SchoolGrade, number>([
      [5, 16],
      [6, 23],
      [7, 18],
      [8, 15],
      [9, 20],
    ])

    for (const [grade, expectedCount] of expectedTopicCountByGrade) {
      expect(
        curriculumTopics.filter((topic) => topic.gradeLevels.includes(grade)).length,
        `${grade} grade topic count`,
      ).toBe(expectedCount)
    }
  })

  it('keeps topics and prerequisites in a valid pedagogical order', () => {
    const topicById = new Map(curriculumTopics.map((topic) => [topic.id, topic]))

    expect(curriculumTopics).toHaveLength(91)
    expect(curriculumTopics.map((topic) => topic.order)).toEqual(
      Array.from({ length: curriculumTopics.length }, (_, index) => index + 1),
    )

    for (const topic of curriculumTopics) {
      for (const prerequisiteId of topic.prerequisiteTopicIds) {
        const prerequisite = topicById.get(prerequisiteId)
        expect(prerequisite, `${topic.id} prerequisite ${prerequisiteId} must exist`).toBeDefined()
        expect(
          prerequisite!.order,
          `${topic.id} prerequisite ${prerequisiteId} must appear earlier`,
        ).toBeLessThan(topic.order)
      }
    }
  })

  it('provides valid metadata and a preview for every topic', () => {
    for (const topic of curriculumTopics) {
      expect(topic.tags.length, `${topic.id} must have tags`).toBeGreaterThan(0)
      expect(new Set(topic.tags).size, `${topic.id} tags must be unique`).toBe(topic.tags.length)
      expect(topic.subtopics.length, `${topic.id} must describe its scope`).toBeGreaterThanOrEqual(
        3,
      )
      expect(new Set(topic.subtopics).size, `${topic.id} subtopics must be unique`).toBe(
        topic.subtopics.length,
      )
      expect(topic.gradeLevels.length, `${topic.id} must have grades`).toBeGreaterThan(0)
      expect(
        topic.gradeLevels.every((grade) => Number.isInteger(grade) && grade >= 1 && grade <= 12),
        `${topic.id} grades must be valid`,
      ).toBe(true)
      expect(topicPreviews[topic.id], `${topic.id} must have a preview`).toBeDefined()
    }
  })

  it('contains the previously missing curriculum blocks for every grade', () => {
    const requiredTopicIdsByGrade = new Map<SchoolGrade, string[]>([
      [
        5,
        [
          'division-with-remainder',
          'powers-natural',
          'fraction-types-mixed',
          'arithmetic-mean',
          'coordinate-ray',
        ],
      ],
      [
        6,
        [
          'prime-factorization',
          'greatest-common-divisor',
          'least-common-multiple',
          'periodic-decimals',
          'direct-proportion',
          'inverse-proportion',
          'grade6-equations',
        ],
      ],
      [
        7,
        [
          'monomials',
          'polynomial-multiplication',
          'common-factor',
          'factor-by-grouping',
          'geometry-foundations-proof',
          'triangle-elements',
        ],
      ],
      [
        8,
        [
          'integer-exponents-standard-form',
          'quadratic-trinomial',
          'central-inscribed-angles',
          'inscribed-circumscribed-figures',
          'right-triangle-metric-relations',
        ],
      ],
      [
        9,
        [
          'function-properties-transformations',
          'quadratic-inequalities',
          'mathematical-modeling',
          'circle-measurements-grade9',
        ],
      ],
    ])

    for (const [grade, requiredTopicIds] of requiredTopicIdsByGrade) {
      const gradeTopicIds = new Set(
        curriculumTopics
          .filter((topic) => topic.gradeLevels.includes(grade))
          .map((topic) => topic.id),
      )
      expect(requiredTopicIds.every((topicId) => gradeTopicIds.has(topicId))).toBe(true)
    }
  })
})
