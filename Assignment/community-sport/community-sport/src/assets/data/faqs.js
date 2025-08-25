import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/pages/HomePage.vue'),
    meta: { title: 'Home · Community Sport' }
  },
  {
    path: '/find',
    name: 'find',
    component: () => import('@/components/pages/FindSportsPage.vue'),
    meta: { title: 'Find Sports · Community Sport' }
    // Access search text via route.query.q (e.g., /find?q=netball)
  },
  {
    path: '/program/:id',
    name: 'program',
    props: true, // passes { id } as a prop
    component: () => import('@/components/pages/ProgramDetailsPage.vue'),
    meta: { title: 'Program Details · Community Sport' }
  },
  {
    path: '/support',
    name: 'support',
    component: () => import('@/components/pages/SupportPage.vue'),
    meta: { title: 'Support · Community Sport' }
  },
  // keep it simple for now: redirect any unknown route to home
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // Always scroll to top on route change (helps mobile usability)
    return { top: 0 };
  }
});

// Optional: update document title from route meta
router.afterEach((to) => {
  if (to.meta?.title) document.title = to.meta.title;
});

export default router;
