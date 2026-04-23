import { createRouter, createWebHistory } from 'vue-router'

import MapHomeView from '../views/MapHomeView.vue'
import StatisticsPageView from '../views/StatisticsPageView.vue'
import TimelinePageView from '../views/TimelinePageView.vue'

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
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsPageView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
