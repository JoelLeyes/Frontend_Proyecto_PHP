<template>
  <div>
    <h1>Buscar Profesionales</h1>

    <div class="filtros">
      <input v-model="filtros.busqueda" placeholder="Nombre o descripción..." @input="busquedaConRetraso" />
      <select v-model="filtros.modalidad" @change="obtenerProfesionales">
        <option value="">Todas las modalidades</option>
        <option value="presencial">Presencial</option>
        <option value="remota">Remota</option>
        <option value="hibrida">Híbrida</option>
      </select>
      <input v-model="filtros.ciudad" placeholder="Ciudad..." @input="busquedaConRetraso" />
    </div>

    <div v-if="cargando">Cargando profesionales...</div>

    <div v-else class="grilla-profesionales">
      <RouterLink
        v-for="profesional in profesionales"
        :key="profesional.id"
        :to="{ name: 'detalle-profesional', params: { id: profesional.id } }"
        class="tarjeta-profesional"
      >
        <img :src="profesional.usuario?.avatar || '/avatar-defecto.png'" :alt="profesional.usuario?.name" />
        <h3>{{ profesional.nombre_negocio || profesional.usuario?.name }}</h3>
        <p>{{ profesional.modalidad }}</p>
        <p>⭐ {{ profesional.promedio_calificacion }} ({{ profesional.total_calificaciones }})</p>
        <p>{{ profesional.ciudad }}</p>
      </RouterLink>
    </div>

    <p v-if="!cargando && profesionales.length === 0">No se encontraron profesionales.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const profesionales = ref([])
const cargando      = ref(false)
const filtros       = ref({ busqueda: '', modalidad: '', ciudad: '' })

let temporizador

function busquedaConRetraso() {
  clearTimeout(temporizador)
  temporizador = setTimeout(obtenerProfesionales, 400)
}

async function obtenerProfesionales() {
  cargando.value = true
  try {
    const { data } = await axios.get('/api/profesionales', { params: filtros.value })
    profesionales.value = data.data
  } finally {
    cargando.value = false
  }
}

onMounted(obtenerProfesionales)
</script>
