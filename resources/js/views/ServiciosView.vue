<template>
  <div>
    <h1>Mis Servicios</h1>
    <button @click="mostrarFormulario = true">+ Nuevo servicio</button>

    <div v-for="servicio in servicios" :key="servicio.id" class="fila-servicio">
      <span>{{ servicio.nombre }}</span>
      <span>${{ servicio.precio }} · {{ servicio.duracion_minutos }} min</span>
      <span>{{ servicio.modalidad }}</span>
      <span>{{ servicio.activo ? 'Activo' : 'Inactivo' }}</span>
    </div>

    <!-- TODO: modal formulario para crear/editar servicios y sus paquetes -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth             = useAuthStore()
const servicios        = ref([])
const mostrarFormulario = ref(false)

onMounted(async () => {
  const idProfesional = auth.usuario?.profesional?.id
  if (!idProfesional) return
  const { data } = await axios.get(`/api/profesionales/${idProfesional}/servicios`)
  servicios.value = data
})
</script>
