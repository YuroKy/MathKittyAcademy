import { describe, expect, it } from 'vitest'

import { curriculumTopics, findTopic } from '@/content/curriculum/topics'
import { grade5TopicIds } from '@/content/curriculum/sequence'
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
  it('makes the first topic ready without saved progress', () => {
    const first = findTopic('same-and-different')
    expect(first).toBeDefined()
    expect(deriveTopicStatus(first!, new Map())).toBe('ready')
  })

  it('unlocks a dependent topic at the configured foundation threshold', () => {
    const topic = findTopic('order-of-operations')
    const saved = new Map([['natural-numbers', progress('natural-numbers', 60)]])

    expect(arePrerequisitesMet(topic!, saved)).toBe(true)
    expect(deriveTopicStatus(topic!, saved)).toBe('ready')
  })

  it('keeps an advanced topic open but marks it as challenging', () => {
    const topic = findTopic('percentages')

    expect(deriveTopicStatus(topic!, new Map())).toBe('challenging')
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
    expect(recommendNextTopic(curriculumTopics, [])?.id).toBe('same-and-different')
  })

  it('recommends fractions before the later geometry block in grade 5', () => {
    const fractionIndex = grade5TopicIds.indexOf('fraction-meaning')
    const completedFoundations = grade5TopicIds
      .slice(0, fractionIndex)
      .map((topicId) => progress(topicId, 80))

    const grade5Topics = curriculumTopics.filter((topic) => topic.gradeLevels.includes(5))
    expect(recommendNextTopic(grade5Topics, completedFoundations)?.id).toBe('fraction-meaning')
  })

  it('recommends geometry after percentages in grade 5', () => {
    const geometryIndex = grade5TopicIds.indexOf('measurement-geometry')
    const completedNumberBlocks = grade5TopicIds
      .slice(0, geometryIndex)
      .map((topicId) => progress(topicId, 80))

    const grade5Topics = curriculumTopics.filter((topic) => topic.gradeLevels.includes(5))
    expect(recommendNextTopic(grade5Topics, completedNumberBlocks)?.id).toBe('measurement-geometry')
  })
})
