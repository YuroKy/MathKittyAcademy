import type { FullLessonContent } from '@/types/domain'

import { elementaryLessons } from './elementaryLessons'
import { grade5Lessons } from './grade5Lessons'

export const fullLessons: Readonly<Record<string, FullLessonContent>> = Object.freeze({
  ...elementaryLessons,
  ...grade5Lessons,
})

export function findFullLesson(topicId: string): FullLessonContent | undefined {
  return fullLessons[topicId]
}
