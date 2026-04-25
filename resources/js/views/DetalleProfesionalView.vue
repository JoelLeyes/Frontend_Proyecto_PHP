<template>
  <div v-if="profesional">
    <h1>{{ profesional.nombre_negocio || profesional.usuario?.name }}</h1>
    <p>{{ profesional.bio }}</p>
    <p>📍 {{ profesional.ciudad }}, {{ profesional.pais }}</p>
    <p>⭐ {{ profesional.promedio_calificacion }} ({{ profesional.total_calificaciones }} reseñas)</p>

    <h2>Servicios disponibles</h2>
    <div v-for="servicio in profesional.servicios" :key="servicio.id" class="tarjeta-servicio">
      <h3>{{ servicio.nombre }}</h3>
      <p>{{ servicio.descripcion }}</p>
      <p>💰 ${{ servicio.precio }} · ⏱ {{ servicio.duracion_minutos }} min · {{ servicio.modalidad }}</p>
      <button @click="abrirReserva(servicio)">Reservar turno</button>
    </div>

    <h2>Reseñas</h2>
    <div v-for="resena in resenas" :key="resena.id" class="tarjeta-resena">
      <strong>{{ resena.evaluador?.name }}</strong> — {{ resena.calificacion }}/5
      <p>{{ resena.comentario }}</p>
    </div>
  </div>
  <div v-else>Cargando...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const ruta         = useRoute()
const profesional  = ref(null)
const resenas      = ref([])

async function cargarDatos() {
  const [resProfesional, resResenas] = await Promise.all([
    axios.get(`/api/profesionales/${ruta.params.id}`),
    axios.get(`/api/profesionales/${ruta.params.id}/resenas`),
  ])
  profesional.value = resProfesional.data
  resenas.value     = resResenas.data.data
}

function abrirReserva(servicio) {
  // TODO: abrir modal con selector de horarios disponibles
  alert(`Reservar: ${servicio.nombre}`)
}

onMounted(cargarDatos)
</script>
