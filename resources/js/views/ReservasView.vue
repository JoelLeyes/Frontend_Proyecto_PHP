<template>
  <div>
    <h1>Mis Reservas</h1>

    <select v-model="filtroEstado" @change="cargarReservas">
      <option value="">Todos los estados</option>
      <option value="pendiente">Pendiente</option>
      <option value="confirmada">Confirmada</option>
      <option value="pagada">Pagada</option>
      <option value="finalizada">Finalizada</option>
      <option value="cancelada">Cancelada</option>
    </select>

    <div v-if="store.cargando">Cargando reservas...</div>

    <table v-else>
      <thead>
        <tr>
          <th>Servicio</th>
          <th>Fecha y hora</th>
          <th>Estado</th>
          <th>Modalidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reserva in store.reservas" :key="reserva.id">
          <td>{{ reserva.servicio?.nombre }}</td>
          <td>{{ formatearFecha(reserva.fecha_hora) }}</td>
          <td>{{ reserva.estado }}</td>
          <td>{{ reserva.modalidad }}</td>
          <td>
            <button
              v-if="puedeCancelarse(reserva)"
              @click="cancelar(reserva.id)"
            >
              Cancelar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!store.cargando && store.reservas.length === 0">No tenés reservas.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReservasStore } from '@/stores/reservas'

const store       = useReservasStore()
const filtroEstado = ref('')

function formatearFecha(fechaHora) {
  return new Date(fechaHora).toLocaleString('es-UY')
}

function puedeCancelarse(reserva) {
  return ['pendiente', 'confirmada', 'pagada'].includes(reserva.estado)
}

async function cancelar(id) {
  if (!confirm('¿Cancelar esta reserva?')) return
  await store.cancelarReserva(id)
}

function cargarReservas() {
  store.obtenerReservas(filtroEstado.value ? { estado: filtroEstado.value } : {})
}

onMounted(cargarReservas)
</script>
