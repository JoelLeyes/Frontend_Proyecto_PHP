<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Mis Paquetes</h1>
    </div>

    <div v-if="cargando" class="cargando" style="padding:3rem">Cargando paquetes...</div>

    <template v-else>
      <!-- Filtro -->
      <div class="paquetes-filtros">
        <button v-for="f in FILTROS" :key="f.valor"
          :class="['tab-btn', filtro === f.valor && 'tab-btn--activo']"
          @click="filtro = f.valor">
          {{ f.label }}
        </button>
      </div>

      <div v-if="paquetesFiltrados.length" class="paquetes-grilla">
        <div v-for="p in paquetesFiltrados" :key="p.id" class="paquete-card">

          <div class="paquete-card__cabecera">
            <div class="paquete-card__info">
              <p class="paquete-card__nombre">{{ p.paquete_servicio?.nombre }}</p>
              <p class="paquete-card__servicio">{{ p.paquete_servicio?.servicio?.nombre }}</p>
              <p class="paquete-card__profesional">
                con {{ p.paquete_servicio?.servicio?.profesional?.usuario?.name || '—' }}
              </p>
            </div>
            <span :class="['insignia', insigniaEstado(p.estado)]">{{ etiquetaEstado(p.estado) }}</span>
          </div>

          <!-- Barra de progreso de sesiones -->
          <div class="paquete-card__progreso">
            <div class="progreso-barra">
              <div
                class="progreso-barra__fill"
                :style="{ width: porcentajeUsado(p) + '%' }"
                :class="p.estado === 'consumido' ? 'progreso-barra__fill--consumido' : ''"
              ></div>
            </div>
            <div class="progreso-texto">
              <span class="progreso-texto__usadas">{{ p.sesiones_usadas }} usadas</span>
              <span class="progreso-texto__total">{{ p.sesiones_total - p.sesiones_usadas }} restantes de {{ p.sesiones_total }}</span>
            </div>
          </div>

          <!-- Detalle -->
          <div class="paquete-card__detalle">
            <span class="paquete-card__dato">📅 Comprado {{ formatFecha(p.fecha_compra) }}</span>
            <span v-if="p.fecha_vencimiento" class="paquete-card__dato">
              ⏳ Vence {{ formatFecha(p.fecha_vencimiento) }}
            </span>
          </div>

          <div v-if="p.paquete_servicio?.descripcion" class="paquete-card__desc">
            {{ p.paquete_servicio.descripcion }}
          </div>

          <!-- CTA: reservar si tiene sesiones disponibles -->
          <div v-if="p.estado === 'activo' && p.sesiones_usadas < p.sesiones_total" class="paquete-card__acciones">
            <RouterLink
              :to="{ name: 'detalle-profesional', params: { id: p.paquete_servicio?.servicio?.profesional?.id } }"
              class="boton-principal boton-sm">
              📅 Reservar sesión
            </RouterLink>
          </div>
          <p v-else-if="p.estado === 'consumido'" class="paquete-card__agotado">
            ✅ Paquete completado
          </p>
        </div>
      </div>

      <div v-else class="estado-vacio">
        <div class="estado-vacio__icono">📦</div>
        <h3>
          {{ filtro ? 'Sin paquetes en este estado' : 'No tenés paquetes aún' }}
        </h3>
        <p>Comprá un paquete desde el perfil de un profesional para ahorrar en sesiones.</p>
        <RouterLink :to="{ name: 'profesionales' }" class="boton-principal" style="margin-top:1rem">
          Buscar profesionales
        </RouterLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const cargando = ref(true)
const paquetes = ref([])
const filtro   = ref('')

const FILTROS = [
  { valor: '',         label: 'Todos' },
  { valor: 'activo',   label: 'Activos' },
  { valor: 'consumido',label: 'Completados' },
  { valor: 'vencido',  label: 'Vencidos' },
]

const ETIQUETAS = { activo: 'Activo', consumido: 'Completado', vencido: 'Vencido' }
const INSIGNIAS = { activo: 'insignia--confirmada', consumido: 'insignia--finalizada', vencido: 'insignia--cancelada' }

function etiquetaEstado(e) { return ETIQUETAS[e] || e }
function insigniaEstado(e) { return INSIGNIAS[e] || '' }

const paquetesFiltrados = computed(() =>
  filtro.value ? paquetes.value.filter(p => p.estado === filtro.value) : paquetes.value
)

function porcentajeUsado(p) {
  if (!p.sesiones_total) return 0
  return Math.round((p.sesiones_usadas / p.sesiones_total) * 100)
}

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function cargar() {
  cargando.value = true
  try {
    const { data } = await axios.get('/api/mis-paquetes')
    paquetes.value = data
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
/* Filtros */
.paquetes-filtros {
  display: flex; gap: .375rem; flex-wrap: wrap; margin-bottom: 1.5rem;
}
.tab-btn {
  padding: .5rem 1rem; border: 1.5px solid var(--color-borde-suave); border-radius: 9999px;
  background: #fff; font-size: .875rem; font-weight: 500; cursor: pointer;
  color: var(--color-texto-suave); transition: border-color .15s, color .15s, background .15s;
}
.tab-btn:hover { border-color: var(--color-primario); color: var(--color-primario); }
.tab-btn--activo {
  background: var(--color-primario); border-color: var(--color-primario);
  color: #fff; font-weight: 600;
}

/* Grid */
.paquetes-grilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

/* Card */
.paquete-card {
  background: #fff;
  border: 1px solid var(--color-borde-suave);
  border-radius: calc(var(--radio-borde) * 1.5);
  padding: 1.25rem;
  box-shadow: var(--sombra);
  display: flex;
  flex-direction: column;
  gap: .875rem;
}

.paquete-card__cabecera {
  display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem;
}
.paquete-card__nombre     { font-weight: 700; font-size: 1rem; margin-bottom: .15rem; }
.paquete-card__servicio   { font-size: .875rem; color: var(--color-primario); font-weight: 500; margin-bottom: .1rem; }
.paquete-card__profesional{ font-size: .8125rem; color: var(--color-texto-suave); }

/* Progreso */
.progreso-barra {
  height: 8px; background: var(--color-borde-suave); border-radius: 9999px; overflow: hidden; margin-bottom: .4rem;
}
.progreso-barra__fill {
  height: 100%; background: linear-gradient(90deg, var(--color-primario), var(--color-acento));
  border-radius: 9999px; transition: width .4s ease;
}
.progreso-barra__fill--consumido { background: linear-gradient(90deg, #22c55e, #16a34a); }
.progreso-texto {
  display: flex; justify-content: space-between; font-size: .8125rem;
}
.progreso-texto__usadas { color: var(--color-texto-suave); }
.progreso-texto__total  { font-weight: 600; color: var(--color-texto-medio); }

/* Detalle */
.paquete-card__detalle { display: flex; flex-wrap: wrap; gap: .75rem; }
.paquete-card__dato    { font-size: .8125rem; color: var(--color-texto-suave); }
.paquete-card__desc    { font-size: .8125rem; color: var(--color-texto-suave); line-height: 1.4; border-top: 1px solid var(--color-borde-suave); padding-top: .75rem; }

.paquete-card__acciones { margin-top: .25rem; }
.paquete-card__agotado  { font-size: .875rem; color: #16a34a; font-weight: 600; margin-top: .25rem; }
.boton-sm { padding: .4rem .875rem; font-size: .875rem; }

/* Estado vacío */
.estado-vacio { text-align: center; padding: 4rem 1rem; color: var(--color-texto-suave); }
.estado-vacio__icono { font-size: 3rem; margin-bottom: 1rem; }
.estado-vacio h3 { font-size: 1.25rem; color: var(--color-texto-medio); margin-bottom: .5rem; }
</style>
