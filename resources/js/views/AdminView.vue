<template>
  <div>
    <h1>Panel Administrativo</h1>
    <div v-if="estadisticas">
      <h2>Usuarios</h2>
      <p>Total: {{ estadisticas.usuarios.total }}</p>
      <p>Clientes: {{ estadisticas.usuarios.clientes }}</p>
      <p>Profesionales: {{ estadisticas.usuarios.profesionales }}</p>

      <h2>Reservas</h2>
      <p>Total: {{ estadisticas.reservas.total }}</p>
      <p>Pendientes: {{ estadisticas.reservas.pendientes }}</p>
      <p>Finalizadas: {{ estadisticas.reservas.finalizadas }}</p>
    </div>
    <div v-else>Cargando estadísticas...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const estadisticas = ref(null)

onMounted(async () => {
  const { data } = await axios.get('/api/admin/estadisticas')
  estadisticas.value = data
})
</script>
