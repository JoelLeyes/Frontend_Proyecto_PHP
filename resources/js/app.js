import '../css/styles.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import enrutador from './router'
import axios from 'axios'
import { useAuthStore } from './stores/auth'

// URL base del backend Laravel API
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://api.agendaonline.cloud-ip.cc'
axios.defaults.headers.common['Accept'] = 'application/json'

// Si hay un token guardado, adjuntarlo a cada petición
const tokenGuardado = localStorage.getItem('token')
if (tokenGuardado) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenGuardado}`
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(enrutador) // Configura el enrutador de Vue.js

const auth = useAuthStore(pinia) // Inicializa el store de autenticación

try {
    await auth.rehidratarSesionGuardada()
} catch (e) {
    console.warn('No se pudo validar la sesión guardada al iniciar la app.', e)
}

app.mount('#app') // Monta la aplicación Vue.js en el elemento con id "app"

// Registrar Service Worker (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { // Registrar el Service Worker cuando la página se haya cargado
        navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
}
