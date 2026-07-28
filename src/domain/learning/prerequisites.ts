import type { CurriculumTopic, TopicProgress, TopicStatus } from '@/types/domain'

const UNLOCK_MASTERY = 60

export function arePrerequisitesMet(
  topic: CurriculumTopic,
  progressByTopicId: ReadonlyMap<string, TopicProgress>,
  unlockMastery = UNLOCK_MASTERY,
): boolean {
  return topic.prerequisiteTopicIds.every(
    (topicId) => (progressByTopicId.get(topicId)?.mastery ?? 0) >= unlockMastery,
  )
}

export function deriveTopicStatus(
  topic: CurriculumTopic,
  progressByTopicId: ReadonlyMap<string, TopicProgress>,
): TopicStatus {
  const saved = progressByTopicId.get(topic.id)

  if (saved?.mastery !== undefined && saved.mastery >= 80 && saved.independentCorrect > 0) {
    return 'mastered'
  }

  if (saved?.status === 'reviewNeeded') {
    return 'reviewNeeded'
  }

  if (saved && saved.attempts > 0) {
    return 'inProgress'
  }

  return arePrerequisitesMet(topic, progressByTopicId) ? 'available' : 'locked'
}

export function missingPrerequisites(
  topic: CurriculumTopic,
  topics: readonly CurriculumTopic[],
  progressByTopicId: ReadonlyMap<string, TopicProgress>,
): CurriculumTopic[] {
  return topic.prerequisiteTopicIds
    .filter((topicId) => (progressByTopicId.get(topicId)?.mastery ?? 0) < UNLOCK_MASTERY)
    .map((topicId) => topics.find((candidate) => candidate.id === topicId))
    .filter((candidate): candidate is CurriculumTopic => candidate !== undefined)
}

export function recommendNextTopic(
  topics: readonly CurriculumTopic[],
  progress: readonly TopicProgress[],
): CurriculumTopic | undefined {
  const progressMap = new Map(progress.map((entry) => [entry.topicId, entry]))
  return [...topics]
    .sort((a, b) => a.order - b.order)
    .find((topic) => {
      const status = deriveTopicStatus(topic, progressMap)
      return status === 'available' || status === 'inProgress' || status === 'reviewNeeded'
    })
}
