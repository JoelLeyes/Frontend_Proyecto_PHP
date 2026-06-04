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

    window.Pusher = Pusher

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
                Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
            },
        },
    })

    window.Echo = echo
    return echo
}

export function getEcho() {
    return echo
}

export function actualizarTokenEcho(token) {
    if (!echo) return
    echo.connector.pusher.config.auth.headers.Authorization = `Bearer ${token}`
}
