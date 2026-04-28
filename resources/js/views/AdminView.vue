<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Panel Administrativo</h1>
    </div>

    <div v-if="cargando" class="cargando">Cargando estadísticas...</div>

    <template v-else-if="estadisticas">
      <!-- Usuarios -->
      <h2 class="admin-seccion-titulo">Usuarios</h2>
      <div class="estadisticas">
        <div class="estadistica-tarjeta">
          <div class="estadistica-tarjeta__valor">{{ estadisticas.usuarios.total }}</div>
          <div class="estadistica-tarjeta__etiqueta">Total de usuarios</div>
        </div>
        <div class="estadistica-tarjeta">
          <div class="estadistica-tarjeta__valor">{{ estadisticas.usuarios.clientes }}</div>
          <div class="estadistica-tarjeta__etiqueta">Clientes</div>
        </div>
        <div class="estadistica-tarjeta">
          <div class="estadistica-tarjeta__valor">{{ estadisticas.usuarios.profesionales }}</div>
          <div class="estadistica-tarjeta__etiqueta">Profesionales</div>
        </div>
      </div>

      <!-- Reservas -->
      <h2 class="admin-seccion-titulo">Reservas</h2>
      <div class="estadisticas">
        <div class="estadistica-tarjeta">
          <div class="estadistica-tarjeta__valor">{{ estadisticas.reservas.total }}</div>
          <div class="estadistica-tarjeta__etiqueta">Total de reservas</div>
        </div>
        <div class="estadistica-tarjeta">
          <div class="estadistica-tarjeta__valor">{{ estadisticas.reservas.pendientes }}</div>
          <div class="estadistica-tarjeta__etiqueta">Pendientes</div>
        </div>
        <div class="estadistica-tarjeta">
          <div class="estadistica-tarjeta__valor">{{ estadisticas.reservas.finalizadas }}</div>
          <div class="estadistica-tarjeta__etiqueta">Finalizadas</div>
        </div>
      </div>
    </template>

    <div v-else class="estado-vacio">
      <div class="estado-vacio__icono">📊</div>
      <p>No se pudieron cargar las estadísticas.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const estadisticas = ref(null)
const cargando     = ref(false)

onMounted(async () => {
  cargando.value = true
  try {
    const { data } = await axios.get('/api/admin/estadisticas')
    estadisticas.value = data
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.admin-seccion-titulo {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-texto-suave);
  margin-bottom: 0.875rem;
}
.admin-seccion-titulo + .estadisticas { margin-bottom: 2rem; }
.estado-vacio {
  text-align: center;
  padding: 4rem;
  color: var(--color-texto-suave);
}
.estado-vacio__icono { font-size: 3rem; margin-bottom: 1rem; }
</style>
