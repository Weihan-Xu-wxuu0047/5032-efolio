import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';

import 'bootscdtrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import 'bootstrap-icons/font/bootstrap-icons.css';

createApp(App).use(router).mount('#app');
