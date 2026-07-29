export const appConfig = {
  productName: 'Math Kitty Academy',
  mascotName: 'Мурка',
  version: '0.1.0',
  dataSchemaVersion: 4,
  contentVersion: 1,
  masteryThresholds: {
    foundationRequiredMax: 24,
    learningMax: 59,
    practiceRequiredMax: 79,
    masteredMin: 80,
  },
  xp: {
    lessonCompleted: 40,
    reviewCompleted: 25,
    topicMastered: 30,
    dailyGoal: 15,
  },
  reviewIntervalsDays: [1, 3, 7, 14],
} as const
