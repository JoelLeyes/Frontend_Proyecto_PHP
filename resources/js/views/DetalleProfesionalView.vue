<template>
  <div v-if="profesional" class="detalle-profesional">

    <!-- Cabecera del profesional -->
    <div class="detalle-profesional__cabecera">
      <div class="detalle-avatar">
        <img v-if="profesional.usuario?.avatar" :src="profesional.usuario.avatar" :alt="profesional.usuario.name" />
        <div v-else class="detalle-avatar__defecto">{{ iniciales }}</div>
      </div>
      <div class="detalle-info">
        <h1>{{ profesional.nombre_negocio || profesional.usuario?.name }}</h1>
        <p class="detalle-info__nombre" v-if="profesional.nombre_negocio">{{ profesional.usuario?.name }}</p>
        <p class="detalle-info__ubicacion">📍 {{ profesional.ciudad }}<span v-if="profesional.pais">, {{ profesional.pais }}</span></p>
        <div class="detalle-info__meta">
          <span v-if="profesional.total_calificaciones > 0" class="detalle-rating">
            ⭐ {{ profesional.promedio_calificacion }}
            <span class="detalle-rating__total">({{ profesional.total_calificaciones }} reseñas)</span>
          </span>
          <span class="modalidad-chip">{{ profesional.modalidad }}</span>
        </div>
        <p v-if="profesional.bio" class="detalle-info__bio">{{ profesional.bio }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="detalle-profesional__tabs">
      <button
        :class="['detalle-profesional__tab', tabActivo === 'servicios' && 'detalle-profesional__tab--activo']"
        @click="tabActivo = 'servicios'"
      >
        💼 Servicios ({{ profesional.servicios?.length ?? 0 }})
      </button>
      <button
        :class="['detalle-profesional__tab', tabActivo === 'resenas' && 'detalle-profesional__tab--activo']"
        @click="tabActivo = 'resenas'"
      >
        ⭐ Reseñas ({{ resenas.length }})
      </button>
    </div>

    <!-- Tab: Servicios -->
    <div v-if="tabActivo === 'servicios'">
      <div v-if="profesional.servicios?.length" class="grilla-servicios">
        <div
          v-for="servicio in profesional.servicios"
          :key="servicio.id"
          class="tarjeta-servicio"
        >
          <div class="tarjeta-servicio__info">
            <p class="tarjeta-servicio__nombre">{{ servicio.nombre }}</p>
            <p class="tarjeta-servicio__descripcion">{{ servicio.descripcion }}</p>
            <div class="tarjeta-servicio__meta">
              <span class="tarjeta-servicio__precio">${{ servicio.precio }}</span>
              <span class="tarjeta-servicio__duracion">⏱ {{ servicio.duracion_minutos }} min</span>
              <span class="tarjeta-servicio__duracion">{{ servicio.modalidad }}</span>
            </div>
          </div>
          <button class="boton-principal" @click="abrirReserva(servicio)">Reservar</button>
        </div>
      </div>
      <div v-else class="estado-vacio">
        <div class="estado-vacio__icono">💼</div>
        <p>Este profesional no tiene servicios publicados aún.</p>
      </div>
    </div>

    <!-- Tab: Reseñas -->
    <div v-if="tabActivo === 'resenas'">
      <div v-if="resenas.length" class="grilla-resenas">
        <div v-for="resena in resenas" :key="resena.id" class="tarjeta-resena">
          <div class="tarjeta-resena__estrellas">
            {{ '⭐'.repeat(resena.calificacion) }}{{ '☆'.repeat(5 - resena.calificacion) }}
          </div>
          <p class="tarjeta-resena__comentario">{{ resena.comentario }}</p>
          <p class="tarjeta-resena__autor">— {{ resena.evaluador?.name }}</p>
        </div>
      </div>
      <div v-else class="estado-vacio">
        <div class="estado-vacio__icono">💬</div>
        <p>Todavía no hay reseñas para este profesional.</p>
      </div>
    </div>

  </div>
  <div v-else class="cargando">Cargando perfil...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const ruta        = useRoute()
const profesional = ref(null)
const resenas     = ref([])
const tabActivo   = ref('servicios')

const iniciales = computed(() => {
  const nombre = profesional.value?.usuario?.name || ''
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

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

<style scoped>
.detalle-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid var(--color-primario-claro);
  box-shadow: var(--sombra-media);
}
.detalle-avatar img { width: 100%; height: 100%; object-fit: cover; }
.detalle-avatar__defecto {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primario), var(--color-primario-oscuro));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}
.detalle-info h1      { font-size: 1.625rem; margin-bottom: 0.25rem; }
.detalle-info__nombre { color: var(--color-texto-suave); font-size: 0.9375rem; margin-bottom: 0.375rem; }
.detalle-info__ubicacion { color: var(--color-texto-suave); font-size: 0.875rem; margin-bottom: 0.625rem; }
.detalle-info__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.875rem;
}
.detalle-rating { font-size: 0.9375rem; font-weight: 600; color: var(--color-advertencia); }
.detalle-rating__total { font-size: 0.8125rem; color: var(--color-texto-suave); font-weight: 400; }
.detalle-info__bio { font-size: 0.9375rem; color: var(--color-texto-suave); line-height: 1.6; max-width: 600px; margin-bottom: 0; }
.modalidad-chip {
  display: inline-block;
  padding: 0.2rem 0.75rem;
  background: var(--color-primario-claro);
  color: var(--color-primario-oscuro);
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: capitalize;
}
.estado-vacio {
  text-align: center;
  padding: 3rem;
  color: var(--color-texto-suave);
}
.estado-vacio__icono { font-size: 2.5rem; margin-bottom: 0.75rem; }
</style>
