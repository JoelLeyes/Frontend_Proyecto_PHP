import { onMounted, onUnmounted } from 'vue'
import { getEcho } from '../services/echo.js'
import { useNotificationStore } from '../stores/notificationStore.js'
import { useAuthStore } from '../stores/auth.js'
import { useReservasStore } from '../stores/reservas.js'

const TITULOS = { success: 'Éxito', error: 'Cancelación', warning: 'Cancelación', info: 'Aviso' }

function generarNotificacion(reserva, accion, userId) {
    const esCliente      = Number(userId) === Number(reserva.cliente_id)
    const esProfesional  = Number(userId) === Number(reserva.profesional_id)
    const servicio       = reserva.servicio?.nombre || 'Servicio'
    const cliente        = reserva.cliente?.name    || 'Un cliente'

    if (accion === 'reprogramada' && esCliente)     return { icono: '📅', texto: `Tu reserva de ${servicio} fue reprogramada`,                tipo: 'info'    }
    if (accion === 'reprogramada' && esProfesional) return { icono: '📅', texto: `La reserva de ${cliente} para ${servicio} fue reprogramada`, tipo: 'info'    }
    if (reserva.estado === 'pendiente'  && esProfesional) return { icono: '📅', texto: `Nueva reserva de ${cliente} para ${servicio}`,        tipo: 'info'    }
    if (reserva.estado === 'confirmada' && esCliente)     return { icono: '✅', texto: `Tu reserva de ${servicio} fue confirmada`,             tipo: 'success' }
    if (reserva.estado === 'cancelada'  && esCliente)     return { icono: '❌', texto: `Tu reserva de ${servicio} fue cancelada`,             tipo: 'error'   }
    if (reserva.estado === 'cancelada'  && esProfesional) return { icono: '❌', texto: `La reserva de ${cliente} para ${servicio} fue cancelada`, tipo: 'warning' }
    if (reserva.estado === 'pagada'     && esProfesional) return { icono: '💳', texto: `${cliente} pagó la reserva de ${servicio}`,           tipo: 'success' }
    if (reserva.estado === 'finalizada' && esCliente)     return { icono: '🏁', texto: `Tu sesión de ${servicio} finalizó`,                  tipo: 'info'    }
    return null
}

export function useReservationEvents() {
    const notifStore   = useNotificationStore()
    const auth         = useAuthStore()
    const reservasStore = useReservasStore()

    function escuchar() {
        const echo   = getEcho()
        const userId = auth.usuario?.id
        if (!echo || !userId) return

        echo.private(`reservas.${userId}`)
            .listen('.reserva.actualizada', ({ reserva, accion = '' }) => {
                if (!reserva) return

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
    }

    onMounted(escuchar)
    onUnmounted(dejar)

    return { escuchar, dejar }
}
