import { createRouter, createWebHistory } from 'vue-router'

import LandingPageView from '../views/LandingPageView.vue'
import MapHomeView from '../views/MapHomeView.vue'
import StatisticsPageView from '../views/StatisticsPageView.vue'
import TimelinePageView from '../views/TimelinePageView.vue'
import { useAuthSessionStore } from '../stores/auth-session'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPageView,
    },
    {
      path: '/map',
      name: 'world-footprints',
      component: MapHomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/journal',
      name: 'travel-journal',
      component: TimelinePageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/memories',
      name: 'travel-memories',
      component: StatisticsPageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/__ui',
      name: 'ui-showcase',
      beforeEnter: () => (import.meta.env.DEV ? true : { path: '/' }),
      component: () => import('../views/UiShowcaseView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const authSessionStore = useAuthSessionStore()

  if (authSessionStore.status === 'restoring') {
    await authSessionStore.restoreSession()
  }

  if (to.path === '/' && authSessionStore.status === 'authenticated') {
    return { path: '/map', replace: true }
  }

  if (to.meta.requiresAuth && authSessionStore.status !== 'authenticated') {
    return { path: '/' }
  }

  return true
})

export default router
