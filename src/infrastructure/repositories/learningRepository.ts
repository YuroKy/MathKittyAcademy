/**
 * Compatibility facade for older feature imports.
 * New code should use sessionRepository, progressRepository or statisticsRepository.
 */
export {
  sessionRepository as learningRepository,
  type LearningStats,
  type RecordAttemptInput,
} from './sessionRepository'
