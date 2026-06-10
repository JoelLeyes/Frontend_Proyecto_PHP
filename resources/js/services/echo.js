import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

let echo = null

export function initializeEcho() {
    if (echo) return echo

    const appKey = import.meta.env.VITE_REVERB_APP_KEY
    if (!appKey) {
        console.warn('VITE_REVERB_APP_KEY no configurado. Echo deshabilitado.')
        return null
    }

    const token = localStorage.getItem('token')
    if (!token) {
        return null
    }

    globalThis.Pusher = Pusher

    try {
        echo = new Echo({
            broadcaster: 'reverb',
            key: appKey,
            wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
            wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
            wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 443,
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: (import.meta.env.VITE_API_URL || '') + '/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        })
    } catch (e) {
        console.warn('Error inicializando Echo. WS deshabilitado.', e)
        echo = null
        return null
    }

    globalThis.Echo = echo
    return echo
}

export function getEcho() {
    return echo
}

export function destroyEcho() {
    if (!echo) return

    try {
        echo.disconnect()
    } catch (e) {
        console.warn('No se pudo desconectar Echo limpiamente.', e)
    }

    echo = null
    globalThis.Echo = null
}

export function actualizarTokenEcho(token) {
    if (!echo) return
    try {
        echo.connector.pusher.config.auth.headers.Authorization = `Bearer ${token}`
    } catch (e) {
        console.warn('No se pudo actualizar el token de Echo.', e)
    }
}
