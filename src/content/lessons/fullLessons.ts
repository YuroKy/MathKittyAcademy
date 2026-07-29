import type { FullLessonContent } from '@/types/domain'

import { elementaryLessons } from './elementaryLessons'
import { grade5Lessons } from './grade5Lessons'
import { grade6Wave1Lessons } from './grade6Wave1Lessons'
import { isGrade6Wave1Approved } from './grade6Wave1Qa'
import { grade6Wave2Lessons } from './grade6Wave2Lessons'
import { isGrade6Wave2Approved } from './grade6Wave2Qa'

const approvedGrade6Wave1 = Object.fromEntries(
  Object.entries(grade6Wave1Lessons).filter(([topicId]) =>
    isGrade6Wave1Approved(topicId as keyof typeof grade6Wave1Lessons),
  ),
)

const approvedGrade6Wave2 = Object.fromEntries(
  Object.entries(grade6Wave2Lessons).filter(([topicId]) =>
    isGrade6Wave2Approved(topicId as keyof typeof grade6Wave2Lessons),
  ),
)

export const fullLessons: Readonly<Record<string, FullLessonContent>> = Object.freeze({
  ...elementaryLessons,
  ...grade5Lessons,
  ...approvedGrade6Wave1,
  ...approvedGrade6Wave2,
})

export function findFullLesson(topicId: string): FullLessonContent | undefined {
  return fullLessons[topicId]
}
