// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'home', component: () => import('../components/pages/HomePage.vue') },
  { path: '/find', name: 'find', component: () => import('../components/pages/FindSportsPage.vue') },
  { path: '/program/:id', name: 'program', props: true, component: () => import('../components/pages/ProgramDetailsPage.vue') },
  { path: '/support', name: 'support', component: () => import('../components/pages/SupportPage.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

export default createRouter({ history: createWebHistory(), routes });