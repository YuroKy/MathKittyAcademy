export const grade6Wave2TopicIds = [
  'fractions-of-quantity',
  'fraction-decimal-conversion',
  'periodic-decimals',
  'ratios-proportions',
  'direct-proportion',
  'inverse-proportion',
  'negative-numbers',
  'signed-arithmetic',
  'grade6-expressions',
  'grade6-equations',
  'coordinate-plane',
  'circle-measurements-grade6',
  'solid-figures-grade6',
  'data-charts-grade6',
  'elementary-combinatorics-grade6',
] as const

export type Grade6Wave2TopicId = (typeof grade6Wave2TopicIds)[number]

export const grade6Wave2Qa: Record<
  Grade6Wave2TopicId,
  { mathApproved: boolean; languageApproved: boolean; pedagogyApproved: boolean }
> = Object.fromEntries(
  grade6Wave2TopicIds.map((topicId) => [
    topicId,
    { mathApproved: true, languageApproved: true, pedagogyApproved: true },
  ]),
) as Record<
  Grade6Wave2TopicId,
  { mathApproved: boolean; languageApproved: boolean; pedagogyApproved: boolean }
>

export function isGrade6Wave2Approved(topicId: Grade6Wave2TopicId): boolean {
  const qa = grade6Wave2Qa[topicId]
  return qa.mathApproved && qa.languageApproved && qa.pedagogyApproved
}
