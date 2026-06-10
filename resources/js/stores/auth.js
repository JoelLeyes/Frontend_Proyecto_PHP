import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { destroyEcho, initializeEcho, actualizarTokenEcho } from '../services/echo.js'

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
        try {
            initializeEcho()
            actualizarTokenEcho(tokenAcceso)
        } catch (e) {
            console.warn('No se pudo inicializar Echo. Continuando sin WS.', e)
        }
    }

    function limpiarSesionLocal() {
        destroyEcho()
        usuario.value = null
        token.value   = null
        localStorage.removeItem('usuario')
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
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

    async function completarSesionOAuth(tokenAcceso) {
        token.value = tokenAcceso
        localStorage.setItem('token', tokenAcceso)
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenAcceso}`
        try {
            initializeEcho()
            actualizarTokenEcho(tokenAcceso)
        } catch (e) {
            console.warn('No se pudo inicializar Echo (OAuth). Continuando sin WS.', e)
        }

        try {
            const { data } = await axios.get('/api/auth/perfil')
            guardarSesion(data, tokenAcceso)
            return data
        } catch (error) {
            limpiarSesionLocal()
            throw error
        }
    }

    async function cerrarSesion() {
        await axios.post('/api/auth/cerrar-sesion').catch(() => {})
        limpiarSesionLocal()
    }

    return { usuario, token, estaLogueado, iniciarSesion, registrar, completarSesionOAuth, cerrarSesion, limpiarSesionLocal }
})
