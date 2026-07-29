import { sessionRepository } from './sessionRepository'

export const progressRepository = {
  listTopicProgress: sessionRepository.listTopicProgress.bind(sessionRepository),
  getGamification: sessionRepository.getGamification.bind(sessionRepository),
  countDueReviews: sessionRepository.countDueReviews.bind(sessionRepository),
}
