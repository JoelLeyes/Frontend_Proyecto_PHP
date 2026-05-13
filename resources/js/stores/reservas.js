import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

/**
 * Store de reservas.
 * Maneja la lista de reservas del usuario, la paginación
 * y las acciones de crear y cancelar reservas.
 */
export const useReservasStore = defineStore('reservas', () => {
    const reservas    = ref([])
    const paginacion  = ref(null)
    const cargando    = ref(false)

    async function obtenerReservas(parametros = {}) {
        cargando.value = true
        try {
            const { data } = await axios.get('/api/reservas', { params: parametros })
            reservas.value   = data.data
            paginacion.value = data
        } finally {
            cargando.value = false
        }
    }

    async function crearReserva(formulario) {
        const { data } = await axios.post('/api/reservas', formulario)
        return data
    }

    async function cancelarReserva(id, motivo = '') {
        const { data } = await axios.post(`/api/reservas/${id}/cancelar`, { motivo })
        const indice = reservas.value.findIndex(r => r.id === id)
        if (indice !== -1) reservas.value[indice] = data
        return data
    }

    async function confirmarReserva(id) {
        const { data } = await axios.post(`/api/reservas/${id}/confirmar`)
        const indice = reservas.value.findIndex(r => r.id === id)
        if (indice !== -1) reservas.value[indice] = data
        return data
    }

    async function reprogramarReserva(id, fechaHora) {
        const { data } = await axios.patch(`/api/reservas/${id}/reprogramar`, { fecha_hora: fechaHora })
        const indice = reservas.value.findIndex(r => r.id === id)
        if (indice !== -1) reservas.value[indice] = data
        return data
    }

    async function crearResena(id, payload) {
        const { data } = await axios.post(`/api/reservas/${id}/resena`, payload)
        const indice = reservas.value.findIndex(r => r.id === id)
        if (indice !== -1) reservas.value[indice].resena = data
        return data
    }

    return { reservas, paginacion, cargando, obtenerReservas, crearReserva, cancelarReserva, confirmarReserva, reprogramarReserva, crearResena }
})
