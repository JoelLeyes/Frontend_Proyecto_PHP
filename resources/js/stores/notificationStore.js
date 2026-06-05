import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref([])
    const historial     = ref([])

    // ── Toasts (auto-dismiss) ────────────────────────────────────────────────
    const addNotification = (notification) => {
        const id = Date.now()
        const notif = {
            id,
            type:    notification.type    || 'info',
            title:   notification.title   || 'Notificación',
            message: notification.message || '',
            timeout: notification.timeout || 5000,
            ...notification,
        }
        notifications.value.push(notif)
        if (notif.timeout > 0) {
            setTimeout(() => removeNotification(id), notif.timeout)
        }
        return id
    }

    const removeNotification = (id) => {
        notifications.value = notifications.value.filter(n => n.id !== id)
    }

    const clearNotifications = () => { notifications.value = [] }

    const success = (message, title = 'Éxito')      => addNotification({ type: 'success', title, message })
    const error   = (message, title = 'Error')       => addNotification({ type: 'error',   title, message, timeout: 7000 })
    const warning = (message, title = 'Aviso')       => addNotification({ type: 'warning', title, message })
    const info    = (message, title = 'Información') => addNotification({ type: 'info',    title, message })

    // ── Historial de campana (persistente en sesión) ─────────────────────────
    const noLeidas = computed(() => historial.value.filter(n => !n.leida).length)

    const agregarAlHistorial = ({ tipo = 'info', icono = '🔔', texto = '' }) => {
        historial.value.unshift({ id: Date.now(), leida: false, tiempo: new Date(), tipo, icono, texto })
        if (historial.value.length > 50) historial.value.pop()
    }

    const marcarTodasLeidas = () => { historial.value.forEach(n => { n.leida = true }) }

    return {
        notifications, historial, noLeidas,
        addNotification, removeNotification, clearNotifications,
        success, error, warning, info,
        agregarAlHistorial, marcarTodasLeidas,
    }
})
