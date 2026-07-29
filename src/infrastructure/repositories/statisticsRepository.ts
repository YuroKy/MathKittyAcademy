import { sessionRepository, type LearningStats } from './sessionRepository'

export type { LearningStats }

export const statisticsRepository = {
  getLearningStats: sessionRepository.getLearningStats.bind(sessionRepository),
}
