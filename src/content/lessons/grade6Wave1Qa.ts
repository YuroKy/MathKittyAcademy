export const grade6Wave1TopicIds = [
  'divisibility',
  'prime-factorization',
  'greatest-common-divisor',
  'least-common-multiple',
  'equivalent-fractions',
  'fraction-addition-different',
  'fraction-multiplication',
] as const

export type Grade6Wave1TopicId = (typeof grade6Wave1TopicIds)[number]

export const grade6Wave1Qa: Record<
  Grade6Wave1TopicId,
  { mathApproved: boolean; languageApproved: boolean; pedagogyApproved: boolean }
> = Object.fromEntries(
  grade6Wave1TopicIds.map((topicId) => [
    topicId,
    { mathApproved: true, languageApproved: true, pedagogyApproved: true },
  ]),
) as Record<
  Grade6Wave1TopicId,
  { mathApproved: boolean; languageApproved: boolean; pedagogyApproved: boolean }
>

export function isGrade6Wave1Approved(topicId: Grade6Wave1TopicId): boolean {
  const qa = grade6Wave1Qa[topicId]
  return qa.mathApproved && qa.languageApproved && qa.pedagogyApproved
}
