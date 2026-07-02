import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/demos',
      name: 'demos',
      component: () => import('@/views/DemosView.vue'),
    },
    {
      path: '/demo/song/:id',
      name: 'demo-song',
      component: () => import('@/views/DemoSongView.vue'),
    },
    {
      path: '/song',
      name: 'song',
      component: () => import('@/views/GameView.vue'),
    },
  ],
})

export default router
