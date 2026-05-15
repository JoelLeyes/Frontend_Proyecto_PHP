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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const resenas = ref([])
const paginacion = ref(null)
const estadisticas = ref(null)
const cargando = ref(true)

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

onMounted(() => cargarResenas())
</script>

<style scoped>
.layout-panel__encabezado {
  margin-bottom: 2rem;
}

.layout-panel__titulo-pagina {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-texto);
  margin: 0;
}

/* Estadísticas */
.tarjetas-estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tarjeta-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #fff;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio-borde);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.tarjeta-stat__icono {
  font-size: 2rem;
  min-width: 3rem;
  text-align: center;
}

.tarjeta-stat__valor {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primario);
  margin: 0;
}

.tarjeta-stat__label {
  font-size: 0.875rem;
  color: var(--color-texto-suave);
  margin: 0.25rem 0 0 0;
}

/* Distribución de calificaciones */
.distribucion-calificaciones {
  background: #fff;
  padding: 1.5rem;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio-borde);
  margin-bottom: 2rem;
}

.distribucion-calificaciones h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--color-texto);
}

.distribucion-barras {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.barra-calificacion {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 1rem;
  align-items: center;
}

.barra-calificacion__label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.barra-calificacion__cantidad {
  color: var(--color-texto-suave);
  font-weight: 400;
}

.barra-calificacion__contenedor {
  background: var(--color-borde-suave);
  border-radius: 9999px;
  height: 8px;
  overflow: hidden;
}

.barra-calificacion__barra {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  transition: width 0.3s ease;
}

/* Reseñas */
.resenas-seccion {
  background: #fff;
  padding: 1.5rem;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio-borde);
}

.resenas-seccion h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: var(--color-texto);
}

.resenas-lista {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tarjeta-resena-profesional {
  padding: 1.25rem;
  border: 1px solid var(--color-borde-suave);
  border-radius: var(--radio-borde);
  background: var(--color-fondo);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.tarjeta-resena-profesional:hover {
  border-color: var(--color-primario-claro);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.tarjeta-resena-profesional__encabezado {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  justify-content: space-between;
}

.avatar-pequeno {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--color-primario-claro);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--color-primario);
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-pequeno img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tarjeta-resena-profesional__info-autor {
  flex: 1;
}

.tarjeta-resena-profesional__autor {
  font-weight: 600;
  font-size: 0.9375rem;
  margin: 0;
  color: var(--color-texto);
}

.tarjeta-resena-profesional__fecha {
  font-size: 0.8125rem;
  color: var(--color-texto-suave);
  margin: 0.25rem 0 0 0;
}

.tarjeta-resena-profesional__calificacion {
  font-size: 1.125rem;
  white-space: nowrap;
}

.tarjeta-resena-profesional__servicio {
  font-size: 0.875rem;
  color: var(--color-texto-medio);
  margin: 0.75rem 0;
}

.tarjeta-resena-profesional__comentario {
  font-size: 0.9375rem;
  color: var(--color-texto);
  line-height: 1.5;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #fff;
  border-left: 2px solid var(--color-primario);
  border-radius: 2px;
}

.tarjeta-resena-profesional__comentario-vacio {
  font-size: 0.875rem;
  color: var(--color-texto-suave);
  margin: 0.75rem 0;
  font-style: italic;
}

.tarjeta-resena-profesional__fecha-servicio {
  font-size: 0.8125rem;
  color: var(--color-texto-suave);
  margin-top: 0.75rem;
}

/* Estado vacío */
.estado-vacio {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-texto-suave);
}

.estado-vacio__icono {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.estado-vacio h3 {
  font-size: 1.125rem;
  color: var(--color-texto-medio);
  margin: 0.5rem 0;
}

.estado-vacio p {
  margin: 0;
  font-size: 0.9375rem;
}

/* Paginación */
.paginacion {
  display: flex;
  gap: 0.375rem;
  justify-content: center;
  padding: 1.5rem 0 0 0;
  flex-wrap: wrap;
}

.paginacion__btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-borde-suave);
  border-radius: var(--radio-borde);
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-texto-medio);
  transition: border-color 0.15s, background 0.15s;
}

.paginacion__btn:hover {
  border-color: var(--color-primario);
  color: var(--color-primario);
}

.paginacion__btn--activo {
  background: var(--color-primario);
  border-color: var(--color-primario);
  color: #fff;
  font-weight: 600;
}

.cargando {
  text-align: center;
  color: var(--color-texto-suave);
  font-size: 0.9375rem;
}
</style>
