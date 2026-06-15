<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Mis Reseñas</h1>
    </div>

    <!-- Estadísticas -->
    <div v-if="!cargando && estadisticas" class="tarjetas-estadisticas">
      <div class="tarjeta-stat">
        <div class="tarjeta-stat__icono">⭐</div>
        <div class="tarjeta-stat__contenido">
          <p class="tarjeta-stat__valor">{{ estadisticas.promedio_calificacion }}</p>
          <p class="tarjeta-stat__label">Promedio de calificación</p>
        </div>
      </div>
      <div class="tarjeta-stat">
        <div class="tarjeta-stat__icono">💬</div>
        <div class="tarjeta-stat__contenido">
          <p class="tarjeta-stat__valor">{{ estadisticas.total_resenas }}</p>
          <p class="tarjeta-stat__label">Reseñas totales</p>
        </div>
      </div>
    </div>

    <!-- Distribución de calificaciones -->
    <div v-if="!cargando && estadisticas" class="distribucion-calificaciones">
      <h3>Distribución de calificaciones</h3>
      <div class="distribucion-barras">
        <div v-for="calif in 5" :key="calif" class="barra-calificacion">
          <div class="barra-calificacion__label">
            <span>{{ calif }} ⭐</span>
            <span class="barra-calificacion__cantidad">{{ estadisticas.distribucion[calif] }}</span>
          </div>
          <div class="barra-calificacion__contenedor">
            <div
              class="barra-calificacion__barra"
              :style="{
                width: estadisticas.total_resenas > 0
                  ? ((estadisticas.distribucion[calif] / estadisticas.total_resenas) * 100) + '%'
                  : '0%'
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reseñas -->
    <div class="resenas-seccion">
      <h3>Todas tus reseñas</h3>

      <div v-if="cargando" class="cargando" style="padding:2rem">Cargando reseñas...</div>

      <template v-else-if="resenas.length">
        <div class="resenas-lista">
          <div v-for="resena in resenas" :key="resena.id" class="tarjeta-resena-profesional">
            <div class="tarjeta-resena-profesional__encabezado">
              <div class="avatar-pequeno">
                <img v-if="resena.evaluador?.avatar" :src="resena.evaluador.avatar" :alt="resena.evaluador.name" />
                <span v-else>{{ iniciales(resena.evaluador?.name) }}</span>
              </div>
              <div class="tarjeta-resena-profesional__info-autor">
                <p class="tarjeta-resena-profesional__autor">{{ resena.evaluador?.name }}</p>
                <p class="tarjeta-resena-profesional__fecha">
                  {{ formatearFecha(resena.created_at) }}
                </p>
              </div>
              <div class="tarjeta-resena-profesional__calificacion">
                {{ '⭐'.repeat(resena.calificacion) }}{{ '☆'.repeat(5 - resena.calificacion) }}
              </div>
            </div>

            <p class="tarjeta-resena-profesional__servicio">
              Servicio: <strong>{{ resena.reserva?.servicio?.nombre }}</strong>
            </p>

            <p v-if="resena.comentario" class="tarjeta-resena-profesional__comentario">
              {{ resena.comentario }}
            </p>

            <p v-else class="tarjeta-resena-profesional__comentario-vacio">
              <em>Sin comentario adicional</em>
            </p>

            <div class="tarjeta-resena-profesional__fecha-servicio">
              📅 {{ formatearFechaServicio(resena.reserva?.fecha_hora) }}
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="paginacion?.last_page > 1" class="paginacion">
          <button
            v-for="p in paginacion.last_page" :key="p"
            :class="['paginacion__btn', p === paginacion.current_page && 'paginacion__btn--activo']"
            @click="cargarPagina(p)"
          >
            {{ p }}
          </button>
        </div>
      </template>

      <div v-else class="estado-vacio">
        <div class="estado-vacio__icono">💬</div>
        <h3>Aún no tenés reseñas</h3>
        <p>Cuando los clientes completen sus servicios y te dejen una reseña, aparecerán aquí.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'
import { getEcho } from '@/services/echo'
import { useAuthStore } from '@/stores/auth'

const resenas = ref([])
const paginacion = ref(null)
const estadisticas = ref(null)
const cargando = ref(true)
const canalActual = ref(null)

const auth = useAuthStore()
const usuarioId = computed(() => auth.usuario?.id || null)

function iniciales(nombre) {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-UY', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

function formatearFechaServicio(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-UY', {
    dateStyle: 'long',
    timeStyle: 'short'
  })
}

async function cargarResenas(pagina = 1) {
  cargando.value = true
  try {
    const { data } = await axios.get('/api/mis-resenas', {
      params: { page: pagina }
    })
    resenas.value = data.data
    paginacion.value = data.pagination
    estadisticas.value = data.estadisticas
  } catch (error) {
    console.error('Error al cargar reseñas:', error)
  } finally {
    cargando.value = false
  }
}

function cargarPagina(p) {
  cargarResenas(p)
}

function escucharResenas() {
  if (!usuarioId.value) return

  const echo = getEcho()
  if (!echo) return

  const channelName = `reservas.${usuarioId.value}`
  if (canalActual.value && canalActual.value !== channelName) {
    echo.leaveChannel(canalActual.value)
  }

  canalActual.value = channelName

  echo
    .private(channelName)
    .listen('.reserva.actualizada', () => {
      const paginaActual = paginacion.value?.current_page || 1
      cargarResenas(paginaActual)
    })
}

function dejarDeEscucharResenas() {
  if (!usuarioId.value) return
  const echo = getEcho()
  if (!echo || !canalActual.value) return
  echo.leaveChannel(canalActual.value)
  canalActual.value = null
}

onMounted(() => {
  cargarResenas()
  escucharResenas()
})

watch(usuarioId, (nuevo, anterior) => {
  if (nuevo && nuevo !== anterior) {
    escucharResenas()
  }
})

onBeforeUnmount(() => {
  dejarDeEscucharResenas()
})
</script>
