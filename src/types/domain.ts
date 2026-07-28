export type DailyGoalMinutes = 10 | 15 | 20
export type SchoolGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type TopicStatus =
  'recommended' | 'ready' | 'challenging' | 'inProgress' | 'reviewNeeded' | 'mastered'
export type ErrorType =
  | 'conceptMisunderstanding'
  | 'calculationError'
  | 'signError'
  | 'operationOrderError'
  | 'fractionRuleError'
  | 'conditionMisread'
  | 'inputMistake'
  | 'unknown'

export interface StudentProfile {
  id: string
  name: string
  avatarId: string
  pinHash?: string
  examDate?: string
  targetScore?: number
  dailyGoalMinutes: DailyGoalMinutes
  preferredStudyDays: number[]
  createdAt: string
  updatedAt: string
}

export interface TopicProgress {
  profileId: string
  topicId: string
  mastery: number
  status: TopicStatus
  attempts: number
  independentCorrect: number
  lastPracticedAt?: string
  masteredAt?: string
}

export interface SkillProgress {
  profileId: string
  skillId: string
  mastery: number
  attempts: number
  correctAttempts: number
  hintedCorrectAttempts: number
  lastPracticedAt?: string
}

export interface LearningSession {
  id: string
  profileId: string
  type: 'diagnostic' | 'lesson' | 'review'
  topicId?: string
  status: 'active' | 'completed' | 'abandoned'
  startedAt: string
  completedAt?: string
  currentStage?: string
  currentExerciseIndex?: number
  exerciseSeeds: string[]
  interactionState?: Record<string, unknown>
  earnedXp: number
}

export interface ExerciseAttempt {
  id: string
  profileId: string
  sessionId: string
  exerciseId: string
  templateId: string
  seed: string
  skillIds: string[]
  submittedAnswer: unknown
  normalizedAnswer: unknown
  isCorrect: boolean
  hintLevelUsed: number
  errorType?: ErrorType
  createdAt: string
}

export interface ReviewItem {
  id: string
  profileId: string
  skillId: string
  intervalStep: number
  dueAt: string
  lastResult?: 'correct' | 'incorrect'
}

export interface MistakeRecord {
  id: string
  profileId: string
  attemptId: string
  topicId: string
  skillIds: string[]
  errorType: ErrorType
  resolved: boolean
  createdAt: string
  resolvedAt?: string
}

export interface GamificationState {
  profileId: string
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  lastGoalDate?: string
  streakFreezes: number
  unlockedAchievementIds: string[]
  unlockedCosmeticIds: string[]
}

export interface AppSettings {
  profileId: string
  soundEnabled: boolean
  reducedMotion: boolean
  highContrast: boolean
  updatedAt: string
}

export interface CurriculumTopic {
  id: string
  slug: string
  title: string
  shortDescription: string
  subtopics: string[]
  tags: string[]
  gradeLevels: SchoolGrade[]
  groupId: string
  prerequisiteTopicIds: string[]
  skillIds: string[]
  lessonIds: string[]
  order: number
  estimatedMinutes: number
}

export type ExerciseKind = 'singleChoice' | 'numericInput' | 'fractionInput'

export interface ExerciseInstance {
  id: string
  templateId: string
  seed: string
  topicId: string
  skillIds: string[]
  difficulty: 1 | 2 | 3 | 4 | 5
  kind: ExerciseKind
  prompt: string
  expectedAnswer: string
  hints: string[]
  solutionSteps: string[]
}

export interface TopicPreview {
  topicId: string
  hook: string
  question: string
  choices: string[]
  correctChoiceIndex: number
  explanation: string
  challengeLabel: string
}

export interface PilotLessonContent {
  topicId: 'natural-numbers' | 'fraction-meaning'
  introTitle: string
  introText: string
  mascotMessage: string
  interactionKind: 'groupingBoard' | 'fractionBar'
  guidedTitle: string
  guidedSteps: string[]
  summaryText: string
}
