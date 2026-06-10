import { onMounted, watch } from 'vue'
import { getEcho } from '../services/echo.js'
import { useNotificationStore } from '../stores/notificationStore.js'
import { useAuthStore } from '../stores/auth.js'
import { useReservasStore } from '../stores/reservas.js'

const TITULOS = { success: 'Éxito', error: 'Cancelación', warning: 'Cancelación', info: 'Aviso' }

// Dedup: evita mostrar la misma notificación dos veces en 3 segundos
const recientes = new Set()

// Guard: evita suscribirse dos veces al mismo canal
let canalActivo = null
let echoSuscrito = null

function generarNotificacion(reserva, accion, userId) {
    const esCliente     = Number(userId) === Number(reserva.cliente_id)
    const esProfesional = Number(userId) === Number(reserva.profesional_id)
    const servicio      = reserva.servicio?.nombre || 'Servicio'
    const cliente       = reserva.cliente?.name    || 'Un cliente'

    const notificacionReprogramada = (() => {
        if (accion === 'reprogramada' && esCliente) {
            return { icono: '📅', texto: `Tu reserva de ${servicio} fue reprogramada`, tipo: 'info' }
        }

        if (accion === 'reprogramada' && esProfesional) {
            return { icono: '📅', texto: `La reserva de ${cliente} para ${servicio} fue reprogramada`, tipo: 'info' }
        }

        return null
    })()

    if (notificacionReprogramada) return notificacionReprogramada

    if (reserva.estado === 'pendiente'  && esProfesional) return { icono: '📅', texto: `Nueva reserva de ${cliente} para ${servicio}`,         tipo: 'info'    }
    if (reserva.estado === 'confirmada' && esCliente)     return { icono: '✅', texto: `Tu reserva de ${servicio} fue confirmada`,              tipo: 'success' }
    if (reserva.estado === 'cancelada'  && esCliente)     return { icono: '❌', texto: `Tu reserva de ${servicio} fue cancelada`,              tipo: 'error'   }
    if (reserva.estado === 'cancelada'  && esProfesional) return { icono: '❌', texto: `La reserva de ${cliente} para ${servicio} fue cancelada`, tipo: 'warning' }
    if (reserva.estado === 'pagada'     && esProfesional) return { icono: '💳', texto: `${cliente} pagó la reserva de ${servicio}`,            tipo: 'success' }
    if (reserva.estado === 'finalizada' && esCliente)     return { icono: '🏁', texto: `Tu sesión de ${servicio} finalizó`,                   tipo: 'info'    }
    return null
}

export function useReservationEvents() {
    const notifStore    = useNotificationStore()
    const auth          = useAuthStore()
    const reservasStore = useReservasStore()

    function escuchar() {
        const echo   = getEcho()
        const userId = auth.usuario?.id
        if (!echo || !userId) return

        // Evitar suscribirse dos veces al mismo canal
        const nombreCanal = `reservas.${userId}`
        if (canalActivo === nombreCanal && echoSuscrito === echo) return

        if (canalActivo && canalActivo !== nombreCanal && echoSuscrito) {
            try {
                echoSuscrito.leave(canalActivo)
            } catch (e) {
                console.warn('No se pudo dejar el canal anterior de reservas.', e)
            }
        }

        canalActivo = nombreCanal
        echoSuscrito = echo

        echo.private(nombreCanal)
            .listen('.reserva.actualizada', ({ reserva, accion = '' }) => {
                if (!reserva) return

                // Dedup: ignorar si este mismo evento ya se procesó hace menos de 3s
                const key = `${reserva.id}:${reserva.updated_at}:${accion}`
                if (recientes.has(key)) return
                recientes.add(key)
                setTimeout(() => recientes.delete(key), 3000)

                // Actualizar store si la reserva está en la lista actual
                const idx = reservasStore.reservas.findIndex(r => r.id === reserva.id)
                if (idx !== -1) reservasStore.reservas[idx] = reserva

                // Generar y mostrar notificación
                const notif = generarNotificacion(reserva, accion, userId)
                if (!notif) return

                notifStore.agregarAlHistorial(notif)
                notifStore.addNotification({
                    type:    notif.tipo,
                    title:   TITULOS[notif.tipo] || 'Aviso',
                    message: notif.texto,
                })
            })
    }

    function dejar() {
        const echo   = getEcho()
        const userId = auth.usuario?.id
        if (echo && userId) echo.leave(`reservas.${userId}`)
        canalActivo = null
        echoSuscrito = null
    }

    onMounted(escuchar)

    // Reintento: si el usuario ya estaba logueado cuando monta el componente
    // pero Echo aún no tenía el token, la suscripción habrá fallado.
    // Este watch vuelve a intentarlo cuando auth.usuario cambia.
    watch(() => auth.usuario?.id, (nuevoId) => {
        if (!nuevoId) {
            canalActivo = null
            echoSuscrito = null
            return
        }

        if (canalActivo !== `reservas.${nuevoId}` || !echoSuscrito || echoSuscrito !== getEcho()) {
            canalActivo = null
            escuchar()
        }
    })

    return { escuchar, dejar }
}
