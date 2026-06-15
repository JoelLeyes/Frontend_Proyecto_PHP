import { onMounted, watch } from 'vue'
import { getEcho } from '../services/echo.js'
import { useAuthStore } from '../stores/auth.js'
import { useNotificationStore } from '../stores/notificationStore.js'

let canalActivo = null
let echoSuscrito = null

function obtenerCanalDeNotificaciones(auth) {
    const usuario = auth.usuario
    if (!usuario) return null

    if (usuario.rol === 'admin') {
        return 'admin.panel'
    }

    if (usuario.rol === 'profesional' && usuario.profesional?.id) {
        return `professional.${usuario.profesional.id}`
    }

    return usuario.id ? `client.${usuario.id}` : null
}

function construirNotificacion(payload = {}) {
    const notificacion = payload.notificacion || payload

    return {
        id: notificacion.id,
        leida: Boolean(notificacion.leida),
        tiempo: notificacion.created_at ? new Date(notificacion.created_at) : new Date(),
        tipo: notificacion.tipo || 'info',
        icono: notificacion.icono || '🔔',
        texto: notificacion.mensaje || notificacion.titulo || '',
    }
}

export function useNotificationEvents() {
    const auth = useAuthStore()
    const notifStore = useNotificationStore()

    function escuchar() {
        const echo = getEcho()
        const nombreCanal = obtenerCanalDeNotificaciones(auth)

        if (!echo || !nombreCanal) return

        if (canalActivo === nombreCanal && echoSuscrito === echo) return

        if (canalActivo && canalActivo !== nombreCanal && echoSuscrito) {
            try {
                echoSuscrito.leave(canalActivo)
            } catch (e) {
                console.warn('No se pudo dejar el canal anterior de notificaciones.', e)
            }
        }

        canalActivo = nombreCanal
        echoSuscrito = echo

        notifStore.cargarDesdeApi()

        echo.private(nombreCanal)
            .listen('.notificacion.creada', (payload = {}) => {
                const notificacion = construirNotificacion(payload)

                if (!notificacion.id) return

                notifStore.agregarAlHistorial(notificacion)
            })
    }

    function dejar() {
        const echo = getEcho()
        const nombreCanal = canalActivo

        if (echo && nombreCanal) {
            try {
                echo.leave(nombreCanal)
            } catch (e) {
                console.warn('No se pudo dejar el canal de notificaciones.', e)
            }
        }

        canalActivo = null
        echoSuscrito = null
    }

    onMounted(escuchar)

    watch(
        () => [auth.usuario?.id, auth.usuario?.rol, auth.usuario?.profesional?.id],
        () => {
            if (!auth.usuario) {
                dejar()
                return
            }

            const nombreCanal = obtenerCanalDeNotificaciones(auth)
            if (!nombreCanal) {
                dejar()
                return
            }

            if (canalActivo !== nombreCanal || echoSuscrito !== getEcho()) {
                dejar()
                escuchar()
            }
        }
    )

    return { escuchar, dejar }
}