<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Mis Reservas</h1>
    </div>

    <!-- Filtro de estado -->
    <div class="filtros" style="margin-bottom:1.5rem">
      <div class="campo">
        <label>Estado</label>
        <select v-model="filtroEstado" @change="cargarReservas">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="pagada">Pagada</option>
          <option value="en_curso">En curso</option>
          <option value="finalizada">Finalizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="store.cargando" class="cargando">Cargando reservas...</div>

    <!-- Tabla de reservas -->
    <div v-else-if="store.reservas.length > 0" class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Fecha y hora</th>
            <th>Modalidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reserva in store.reservas" :key="reserva.id">
            <td><strong>{{ reserva.servicio?.nombre }}</strong></td>
            <td>{{ formatearFecha(reserva.fecha_hora) }}</td>
            <td style="text-transform:capitalize">{{ reserva.modalidad }}</td>
            <td>
              <span :class="['insignia', `insignia--${reserva.estado.replace('_', '-')}`]">
                {{ reserva.estado.replace('_', ' ') }}
              </span>
            </td>
            <td>
              <button
                v-if="puedeCancelarse(reserva)"
                class="boton-peligro"
                @click="cancelar(reserva.id)"
              >
                Cancelar
              </button>
              <span v-else style="color:var(--color-texto-suave);font-size:0.875rem">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sin reservas -->
    <div v-else class="estado-vacio">
      <div class="estado-vacio__icono">📅</div>
      <h3>Sin reservas</h3>
      <p>Cuando reserves un turno, aparecerá aquí.</p>
      <RouterLink :to="{ name: 'profesionales' }" class="boton-principal" style="margin-top:1rem">
        Buscar profesionales
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReservasStore } from '@/stores/reservas'

const store        = useReservasStore()
const filtroEstado = ref('')

function formatearFecha(fechaHora) {
  return new Date(fechaHora).toLocaleString('es-UY', {
    dateStyle: 'medium', timeStyle: 'short',
  })
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

<style scoped>
.estado-vacio {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--color-texto-suave);
}
.estado-vacio__icono { font-size: 3rem; margin-bottom: 1rem; }
.estado-vacio h3 { font-size: 1.25rem; color: var(--color-texto-medio); margin-bottom: 0.5rem; }
</style>
