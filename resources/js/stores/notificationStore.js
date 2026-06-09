import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useNotificationStore = defineStore('notifications', () => {
    const notifications = ref([])
    const historial     = ref([])

    // ── Carga desde API al arrancar ──────────────────────────────────────────
    const cargarDesdeApi = async () => {
        try {
            const { data } = await axios.get('/api/notificaciones')
            historial.value = data.map(n => ({
                id:     n.id,
                leida:  n.leida,
                tiempo: new Date(n.created_at),
                tipo:   n.tipo,
                icono:  n.icono,
                texto:  n.mensaje,
            }))
        } catch {
            // Si falla (sin sesión, red caída), el historial queda vacío
        }
    }

    const marcarLeidasEnApi = async () => {
        try {
            await axios.post('/api/notificaciones/leer-todas')
        } catch { /* silencioso */ }
    }

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
        cargarDesdeApi, marcarLeidasEnApi,
    }
})
