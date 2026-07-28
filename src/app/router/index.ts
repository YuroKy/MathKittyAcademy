import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router'

import { useProfileStore } from '@/stores/profile'

const protectedRoute = { requiresProfile: true }

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'entry',
    component: () => import('@/features/entry/EntryView.vue'),
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('@/features/welcome/WelcomeView.vue'),
  },
  {
    path: '/profiles',
    name: 'profiles',
    component: () => import('@/features/profiles/ProfilesView.vue'),
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/features/onboarding/OnboardingView.vue'),
  },
  {
    path: '/diagnostic',
    name: 'diagnostic',
    component: () => import('@/features/placeholder/FeaturePreviewView.vue'),
    meta: { ...protectedRoute, feature: 'diagnostic' },
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/features/dashboard/HomeView.vue'),
    meta: protectedRoute,
  },
  {
    path: '/learn/:topicId',
    name: 'lesson',
    component: () => import('@/features/lesson-player/LessonView.vue'),
    meta: protectedRoute,
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('@/features/placeholder/FeaturePreviewView.vue'),
    meta: { ...protectedRoute, feature: 'review' },
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/features/learning-map/LearningMapView.vue'),
    meta: protectedRoute,
  },
  {
    path: '/mistakes',
    name: 'mistakes',
    component: () => import('@/features/placeholder/FeaturePreviewView.vue'),
    meta: { ...protectedRoute, feature: 'mistakes' },
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('@/features/progress/ProgressView.vue'),
    meta: protectedRoute,
  },
  {
    path: '/collection',
    name: 'collection',
    component: () => import('@/features/collection/CollectionView.vue'),
    meta: protectedRoute,
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/features/placeholder/FeaturePreviewView.vue'),
    meta: { ...protectedRoute, feature: 'settings' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_MODE === 'hash'
      ? createWebHashHistory(import.meta.env.BASE_URL)
      : createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const profileStore = useProfileStore()
  await profileStore.initialize()

  if (to.meta.requiresProfile && !profileStore.activeProfile) {
    return { name: profileStore.hasProfiles ? 'profiles' : 'welcome' }
  }

  if (
    profileStore.activeProfile &&
    (to.name === 'welcome' || to.name === 'onboarding')
  ) {
    return { name: 'home' }
  }

  return true
})
