// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/AuthService.js';

const routes = [
  { path: '/', name: 'home', component: () => import('../components/pages/HomePage.vue') },
  { path: '/find', name: 'find', component: () => import('../components/pages/FindSportsPage.vue') },
  { path: '/program/:id', name: 'program', props: true, component: () => import('../components/pages/ProgramDetailsPage.vue') },
  { path: '/support', name: 'support', component: () => import('../components/pages/SupportPage.vue') },
  
  // Authentication routes
  { path: '/login', name: 'login', component: () => import('../components/pages/LoginPage.vue') },
  { path: '/register', name: 'register', component: () => import('../components/pages/RegisterPage.vue') },
  
  // Account routes (protected)
  { 
    path: '/account/member', 
    name: 'member-account', 
    component: () => import('../components/pages/MemberAccountPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'member' }
  },
  { 
    path: '/account/organizer', 
    name: 'organizer-account', 
    component: () => import('../components/pages/OrganizerAccountPage.vue'),
    meta: { requiresAuth: true, requiresRole: 'organizer' }
  },
  
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({ history: createWebHistory(), routes });

// Route guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresRole = to.meta.requiresRole;
  const currentUser = authService.getCurrentUser();
  
  if (requiresAuth && !currentUser.user) {
    // Redirect to login if authentication is required
    next({ name: 'login' });
    return;
  }
  
  if (requiresRole && currentUser.role !== requiresRole) {
    // Redirect to home if user doesn't have required role
    next({ name: 'home' });
    return;
  }
  
  next();
});

export default router;