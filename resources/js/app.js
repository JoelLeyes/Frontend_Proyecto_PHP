import '../css/styles.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import enrutador from './router'
import axios from 'axios'

// URL base del backend Laravel API
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://api.agendaonline.cloud-ip.cc'
axios.defaults.headers.common['Accept'] = 'application/json'

// Si hay un token guardado, adjuntarlo a cada petición
const tokenGuardado = localStorage.getItem('token')
if (tokenGuardado) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`
}

const app = createApp(App)
app.use(createPinia())
app.use(enrutador)
app.mount('#app')
