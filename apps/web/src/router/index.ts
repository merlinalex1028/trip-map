import { createRouter, createWebHashHistory } from 'vue-router'

import MapHomeView from '../views/MapHomeView.vue'
import TimelinePageView from '../views/TimelinePageView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
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
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
