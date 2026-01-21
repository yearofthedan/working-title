import { createRouter, createWebHistory } from 'vue-router'

export const RouteNames = {
  Home: 'home',
  Demo: 'demo',
  Project: 'project',
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
      path: '/project',
      name: RouteNames.Project,
      component: () => import('@/features/writing-project/WritingProjectPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: RouteNames.NotFound,
      component: () => import('@/features/page-errors/NotFoundPage.vue'),
    },
  ],
})
