import { createRouter, createWebHistory } from 'vue-router'

import MapHomeView from '../views/MapHomeView.vue'
import StatisticsPageView from '../views/StatisticsPageView.vue'
import TimelinePageView from '../views/TimelinePageView.vue'
import { useAuthSessionStore } from '../stores/auth-session'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'map-home',
      component: MapHomeView,
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: TimelinePageView,
      meta: { requiresAuth: true },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsPageView,
      meta: { requiresAuth: true },
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

  if (to.meta.requiresAuth && authSessionStore.status !== 'authenticated') {
    return { path: '/' }
  }

  return true
})

export default router
