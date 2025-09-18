import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'


import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAkHSPr_NtPtfrRXnvr_VcYgtnIQ9sE_gE",
  authDomain: "fit5032-week6-6852d.firebaseapp.com",
  projectId: "fit5032-week6-6852d",
  storageBucket: "fit5032-week6-6852d.firebasestorage.app",
  messagingSenderId: "115678977871",
  appId: "1:115678977871:web:658c067b8cdac5f3922f3a"
};

initializeApp(firebaseConfig)
// Initialize Firebase

const app = createApp(App)
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
})
app.mount('#app')