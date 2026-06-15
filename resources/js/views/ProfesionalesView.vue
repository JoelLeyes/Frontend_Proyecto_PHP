<template>
  <div class="seccion">
    <h1 class="seccion__titulo">Profesionales</h1>

    <!-- Filtros -->
    <div class="filtros">
      <div class="campo">
        <label>Buscar</label>
        <input v-model="filtros.busqueda" placeholder="Nombre o descripción..." @input="busquedaConRetraso" />
      </div>
      <div class="campo">
        <label>Modalidad</label>
        <select v-model="filtros.modalidad" @change="obtenerProfesionales">
          <option value="">Todas</option>
          <option value="presencial">Presencial</option>
          <option value="remota">Remota</option>
          <option value="hibrida">Híbrida</option>
        </select>
      </div>
      <div class="campo">
        <label>Ciudad</label>
        <input v-model="filtros.ciudad" placeholder="Ej: Montevideo" @input="busquedaConRetraso" />
      </div>
    </div>

    <!-- Estado cargando -->
    <div v-if="cargando" class="cargando">Buscando profesionales...</div>

    <!-- Resultados -->
    <div v-else-if="profesionales.length > 0" class="grilla-profesionales">
      <RouterLink
        v-for="p in profesionales"
        :key="p.id"
        :to="{ name: 'detalle-profesional', params: { id: p.id } }"
        class="tarjeta-profesional"
      >
        <div class="tarjeta-profesional__imagen-wrap">
          <img
            v-if="p.usuario?.avatar"
            :src="p.usuario.avatar"
            :alt="p.usuario.name"
            class="tarjeta-profesional__imagen"
          />
          <div v-else class="tarjeta-profesional__avatar-defecto">
            {{ iniciales(p.usuario?.name) }}
          </div>
        </div>
        <div class="tarjeta-profesional__cuerpo">
          <p class="tarjeta-profesional__nombre">{{ p.nombre_negocio || p.usuario?.name }}</p>
          <p class="tarjeta-profesional__negocio">{{ p.usuario?.name }}</p>
          <p v-if="p.total_calificaciones > 0" class="tarjeta-profesional__calificacion">
            ⭐ {{ p.promedio_calificacion }}
            <span class="tarjeta-profesional__clasificacion">{{ clasificacionPromedio(p.promedio_calificacion) }}</span>
            <span style="color:var(--color-texto-suave)">({{ p.total_calificaciones }} reseñas)</span>
          </p>
        </div>
      </RouterLink>
    </div>

    <!-- Sin resultados -->
    <div v-else class="estado-vacio">
      <div class="estado-vacio__icono">🔍</div>
      <h3>Sin resultados</h3>
      <p>Intentá con otros filtros o buscá por otro nombre.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const profesionales = ref([])
const cargando      = ref(false)
const filtros       = ref({ busqueda: '', modalidad: '', ciudad: '' })

let temporizador

function iniciales(nombre) {
  if (!nombre) return '?'
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function busquedaConRetraso() {
  clearTimeout(temporizador)
  temporizador = setTimeout(obtenerProfesionales, 400)
}

function clasificacionPromedio(promedio) {
  if (promedio >= 4.6) return 'Excelente'
  if (promedio >= 4.1) return 'Muy bueno'
  if (promedio >= 3.1) return 'Bueno'
  if (promedio >= 2.1) return 'Regular'
  return 'A mejorar'
}

async function obtenerProfesionales() {
  cargando.value = true
  try {
    const params = {
      busqueda:  filtros.value.busqueda,
      modalidad: filtros.value.modalidad,
    }

    if (filtros.value.ciudad.trim()) {
      try {
        const geo = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: filtros.value.ciudad, format: 'json', limit: 1 },
          headers: { 'Accept-Language': 'es' },
        })
        if (geo.data[0]) {
          params.lat   = geo.data[0].lat
          params.lng   = geo.data[0].lon
          params.radio = 50
        }
      } catch {
        // si nominatim falla no aplica filtro de ciudad
      }
    }

    const { data } = await axios.get('/api/profesionales', { params })
    profesionales.value = data.data
  } finally {
    cargando.value = false
  }
}

onMounted(obtenerProfesionales)
</script>
