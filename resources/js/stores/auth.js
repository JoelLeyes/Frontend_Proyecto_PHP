import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

/**
 * Store de autenticación.
 * Maneja el estado del usuario logueado, el token de Sanctum
 * y los métodos para iniciar/cerrar sesión.
 */
export const useAuthStore = defineStore('auth', () => {
    const usuario = ref(JSON.parse(localStorage.getItem('usuario') || 'null'))
    const token   = ref(localStorage.getItem('token') || null)

    const estaLogueado = computed(() => !!token.value)

    function guardarSesion(datosUsuario, tokenAcceso) {
        usuario.value = datosUsuario
        token.value   = tokenAcceso
        localStorage.setItem('usuario', JSON.stringify(datosUsuario))
        localStorage.setItem('token', tokenAcceso)
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenAcceso}`
    }

    async function iniciarSesion(email, password) {
        const { data } = await axios.post('/api/auth/iniciar-sesion', { email, password })
        guardarSesion(data.usuario, data.token)
        return data.usuario
    }

    async function registrar(formulario) {
        const { data } = await axios.post('/api/auth/registrar', formulario)
        guardarSesion(data.usuario, data.token)
        return data.usuario
    }

    async function cerrarSesion() {
        await axios.post('/api/auth/cerrar-sesion').catch(() => {})
        usuario.value = null
        token.value   = null
        localStorage.removeItem('usuario')
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
    }

    return { usuario, token, estaLogueado, iniciarSesion, registrar, cerrarSesion }
})
