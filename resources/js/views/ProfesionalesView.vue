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
          <p class="tarjeta-profesional__ciudad">📍 {{ p.ciudad }}<span v-if="p.pais">, {{ p.pais }}</span></p>
          <p v-if="p.total_calificaciones > 0" class="tarjeta-profesional__calificacion">
            ⭐ {{ p.promedio_calificacion }} <span style="color:var(--color-texto-suave)">({{ p.total_calificaciones }} reseñas)</span>
          </p>
          <div class="tarjeta-profesional__pie">
            <span class="modalidad-badge">{{ p.modalidad }}</span>
          </div>
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

<style scoped>
.tarjeta-profesional__imagen-wrap {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primario-claro), #e0f2fe);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tarjeta-profesional__imagen {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tarjeta-profesional__avatar-defecto {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-primario);
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modalidad-badge {
  display: inline-block;
  padding: 0.2rem 0.625rem;
  background: var(--color-primario-claro);
  color: var(--color-primario-oscuro);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.estado-vacio {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--color-texto-suave);
}
.estado-vacio__icono { font-size: 3rem; margin-bottom: 1rem; }
.estado-vacio h3 { font-size: 1.25rem; color: var(--color-texto-medio); margin-bottom: 0.5rem; }
</style>
