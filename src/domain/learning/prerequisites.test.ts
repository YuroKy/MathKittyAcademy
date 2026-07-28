import { describe, expect, it } from 'vitest'

import { curriculumTopics, findTopic } from '@/content/curriculum/topics'
import type { TopicProgress } from '@/types/domain'

import {
  arePrerequisitesMet,
  deriveTopicStatus,
  missingPrerequisites,
  recommendNextTopic,
} from './prerequisites'

function progress(topicId: string, mastery: number): TopicProgress {
  return {
    profileId: 'profile',
    topicId,
    mastery,
    status: 'inProgress',
    attempts: 3,
    independentCorrect: 2,
  }
}

describe('curriculum prerequisites', () => {
  it('makes the first topic available without saved progress', () => {
    const first = findTopic('natural-numbers')
    expect(first).toBeDefined()
    expect(deriveTopicStatus(first!, new Map())).toBe('available')
  })

  it('unlocks a dependent topic at the configured foundation threshold', () => {
    const topic = findTopic('order-of-operations')
    const saved = new Map([['natural-numbers', progress('natural-numbers', 60)]])

    expect(arePrerequisitesMet(topic!, saved)).toBe(true)
    expect(deriveTopicStatus(topic!, saved)).toBe('available')
  })

  it('explains which prerequisite is still missing', () => {
    const topic = findTopic('fraction-addition-different')
    const saved = new Map([
      ['equivalent-fractions', progress('equivalent-fractions', 72)],
      ['fraction-addition-equal', progress('fraction-addition-equal', 30)],
    ])

    expect(missingPrerequisites(topic!, curriculumTopics, saved).map((entry) => entry.id)).toEqual([
      'fraction-addition-equal',
    ])
  })

  it('recommends the earliest available unfinished topic', () => {
    expect(recommendNextTopic(curriculumTopics, [])?.id).toBe('natural-numbers')
  })
})
