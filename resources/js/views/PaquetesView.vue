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

          <!-- CTA según estado -->
          <div v-if="p.estado === 'pendiente_pago'" class="paquete-card__acciones">
            <button class="boton-principal boton-sm" @click="abrirPago(p)">
              💳 Completar pago
            </button>
          </div>
          <div v-else-if="p.estado === 'activo' && p.sesiones_usadas < p.sesiones_total" class="paquete-card__acciones">
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

    <!-- Modal pago PayPal -->
    <Teleport to="body">
      <div v-if="modalPago.abierto" class="modal-overlay" @click.self="cerrarModalPago">
        <div class="modal">
          <div class="modal__cabecera">
            <div>
              <h3 class="modal__titulo">Completar pago</h3>
              <p class="modal__subtitulo">{{ modalPago.paquete?.paquete_servicio?.nombre }}</p>
            </div>
            <button class="modal__cerrar" @click="cerrarModalPago">✕</button>
          </div>
          <div class="modal__cuerpo">
            <div class="compra-resumen" style="margin-bottom:1rem">
              <div class="compra-resumen__detalle">
                <span>{{ modalPago.paquete?.sesiones_total }} sesiones</span>
                <span class="compra-resumen__precio">${{ modalPago.paquete?.paquete_servicio?.precio }}</span>
              </div>
            </div>
            <BotonPago
              v-if="modalPago.paquete"
              tipo="paquete"
              :entidad-id="modalPago.paquete.id"
              @pagado="onPagado"
            />
            <p v-if="modalPago.exito" class="alerta alerta--exito">{{ modalPago.exito }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { getEcho } from '@/services/echo'
import BotonPago from '@/components/BotonPago.vue'

const cargando = ref(true)
const paquetes = ref([])
const filtro   = ref('')
const auth     = useAuthStore()
let canalPaquetesCliente = null

const FILTROS = [
  { valor: '',               label: 'Todos' },
  { valor: 'pendiente_pago', label: 'Pendientes' },
  { valor: 'activo',         label: 'Activos' },
  { valor: 'consumido',      label: 'Completados' },
  { valor: 'vencido',        label: 'Vencidos' },
]

const ETIQUETAS = {
  pendiente_pago: 'Pago pendiente',
  activo:         'Activo',
  consumido:      'Completado',
  vencido:        'Vencido',
}
const INSIGNIAS = {
  pendiente_pago: 'insignia--pendiente',
  activo:         'insignia--confirmada',
  consumido:      'insignia--finalizada',
  vencido:        'insignia--cancelada',
}

function etiquetaEstado(e) { return ETIQUETAS[e] || e }
function insigniaEstado(e) { return INSIGNIAS[e] || '' }

// ── Modal de pago ─────────────────────────────────────────────────────────────
const modalPago = ref({ abierto: false, paquete: null, exito: '' })

function abrirPago(p) {
  modalPago.value = { abierto: true, paquete: p, exito: '' }
}

function cerrarModalPago() {
  modalPago.value.abierto = false
}

function onPagado() {
  modalPago.value.exito = '✅ ¡Pago completado! El paquete ya está activo.'
  setTimeout(() => { cerrarModalPago(); cargar() }, 2000)
}

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

function suscribirMisPaquetes() {
  const echo = getEcho()
  const clienteId = auth.usuario?.id

  if (!echo || !clienteId) return

  const nuevoCanal = `client.${clienteId}`
  if (canalPaquetesCliente === nuevoCanal) return

  if (canalPaquetesCliente) {
    try {
      echo.leave(canalPaquetesCliente)
    } catch (error) {
      console.warn('No se pudo salir del canal anterior de paquetes.', error)
    }
  }

  canalPaquetesCliente = nuevoCanal

  echo.private(nuevoCanal).listen('.paquete.cliente.actualizado', () => {
    cargar()
  })
}

function limpiarSuscripcionMisPaquetes() {
  const echo = getEcho()
  if (echo && canalPaquetesCliente) {
    try {
      echo.leave(canalPaquetesCliente)
    } catch (error) {
      console.warn('No se pudo limpiar el canal de paquetes del cliente.', error)
    }
  }

  canalPaquetesCliente = null
}

onMounted(() => {
  cargar()
  suscribirMisPaquetes()
})

watch(() => auth.usuario?.id, () => {
  suscribirMisPaquetes()
})

onBeforeUnmount(() => {
  limpiarSuscripcionMisPaquetes()
})
</script>

