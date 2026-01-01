import { createRouter, createWebHistory } from 'vue-router'

export const RouteNames = {
  Home: 'home',
  Demo: 'demo',
  Story: 'story',
  NotFound: 'not-found',
} as const

const routerHistory = createWebHistory()
export const router = createRouter({
  history: routerHistory,
  strict: true,
  routes: [
    { path: '/', name: RouteNames.Home, component: () => import('@/features/home/HomePage.vue') },
    {
      path: '/demo',
      name: RouteNames.Demo,
      component: () => import('@/features/demo/DemoPage.vue'),
    },
    {
      path: '/story',
      name: RouteNames.Story,
      component: () => import('@/features/story/StoryPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteNames.NotFound,
      component: () => import('@/features/page-errors/NotFoundPage.vue'),
    },
  ],
})
