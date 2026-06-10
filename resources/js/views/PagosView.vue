<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Cobros recibidos</h1>
    </div>

    <!-- Filtros de fecha -->
    <div class="pagos-filtros">
      <div class="campo-inline">
        <label>Desde</label>
        <input type="date" v-model="desde" @change="cargar" />
      </div>
      <div class="campo-inline">
        <label>Hasta</label>
        <input type="date" v-model="hasta" @change="cargar" />
      </div>
      <button class="boton-secundario boton-sm" @click="limpiarFiltros">Limpiar</button>
    </div>

    <!-- Totalizador -->
    <div v-if="!cargando && pagos.length" class="pagos-resumen">
      <div class="resumen-card">
        <span class="resumen-card__valor">${{ totalFormato }}</span>
        <span class="resumen-card__label">Total cobrado</span>
      </div>
      <div class="resumen-card">
        <span class="resumen-card__valor">{{ pagos.length }}</span>
        <span class="resumen-card__label">Transacciones</span>
      </div>
    </div>

    <div v-if="cargando" class="cargando" style="padding:3rem">Cargando cobros...</div>

    <template v-else>
      <div v-if="pagos.length" class="pagos-tabla-wrapper">
        <table class="pagos-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Concepto</th>
              <th>Tipo</th>
              <th class="pagos-tabla__monto">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pagos" :key="p.id">
              <td class="pagos-tabla__fecha">{{ formatFecha(p.created_at) }}</td>
              <td>{{ p.cliente?.name || '—' }}</td>
              <td class="pagos-tabla__concepto">{{ conceptoPago(p) }}</td>
              <td>
                <span :class="['insignia', tipoInsignia(p)]">{{ tipoLabel(p) }}</span>
              </td>
              <td class="pagos-tabla__monto pagos-tabla__monto--valor">
                ${{ Number(p.monto).toFixed(2) }} <span class="pagos-tabla__moneda">{{ p.moneda }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="meta && meta.last_page > 1" class="paginacion">
        <button class="boton-secundario boton-sm" :disabled="pagina === 1" @click="irA(pagina - 1)">← Anterior</button>
        <span class="paginacion__info">Página {{ meta.current_page }} de {{ meta.last_page }}</span>
        <button class="boton-secundario boton-sm" :disabled="pagina === meta.last_page" @click="irA(pagina + 1)">Siguiente →</button>
      </div>

      <div v-if="!pagos.length" class="estado-vacio">
        <div class="estado-vacio__icono">💳</div>
        <h3>Sin cobros registrados</h3>
        <p>Los pagos de tus clientes aparecerán aquí.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getEcho } from '@/services/echo'
import axios from 'axios'

const auth   = useAuthStore()
const pagos  = ref([])
const meta   = ref(null)
const pagina = ref(1)
const desde  = ref('')
const hasta  = ref('')
const cargando = ref(true)
let canalCobros = null

const totalFormato = computed(() => {
  const suma = pagos.value.reduce((acc, p) => acc + Number(p.monto), 0)
  return suma.toFixed(2)
})

async function cargar() {
  cargando.value = true
  try {
    const profesionalId = auth.usuario?.profesional?.id
    if (!profesionalId) return

    const params = { page: pagina.value }
    if (desde.value) params.desde = desde.value
    if (hasta.value) params.hasta = hasta.value

    const { data } = await axios.get(`/api/profesionales/${profesionalId}/pagos`, { params })
    pagos.value = data.data ?? data
    meta.value  = data.meta ?? null
  } finally {
    cargando.value = false
  }
}

function limpiarFiltros() {
  desde.value = ''; hasta.value = ''; pagina.value = 1; cargar()
}

function irA(n) { pagina.value = n; cargar() }

function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-UY', { day: '2-digit', month: 'short', year: 'numeric' })
}

function conceptoPago(p) {
  if (p.pagable_type?.includes('Reserva')) {
    return p.pagable ? `Reserva #${p.pagable.id}` : 'Reserva individual'
  }
  if (p.pagable_type?.includes('PaqueteCliente')) {
    return p.pagable?.paquete_servicio?.nombre
      ? `Paquete: ${p.pagable.paquete_servicio.nombre}`
      : 'Paquete de sesiones'
  }
  return '—'
}

function tipoLabel(p) {
  return p.pagable_type?.includes('Reserva') ? 'Reserva' : 'Paquete'
}

function tipoInsignia(p) {
  return p.pagable_type?.includes('Reserva') ? 'insignia--confirmada' : 'insignia--pendiente'
}

function suscribirCobrosProfesional() {
  const echo = getEcho()
  const profesionalId = auth.usuario?.profesional?.id

  if (!echo || !profesionalId) return

  const nuevoCanal = `professional.${profesionalId}`
  if (canalCobros === nuevoCanal) return

  if (canalCobros) {
    try {
      echo.leave(canalCobros)
    } catch (error) {
      console.warn('No se pudo salir del canal anterior de cobros.', error)
    }
  }

  canalCobros = nuevoCanal

  echo.private(nuevoCanal).listen('.cobro.actualizado', () => {
    cargar()
  })
}

function limpiarSuscripcionCobros() {
  const echo = getEcho()

  if (echo && canalCobros) {
    try {
      echo.leave(canalCobros)
    } catch (error) {
      console.warn('No se pudo limpiar el canal de cobros.', error)
    }
  }

  canalCobros = null
}

onMounted(() => {
  cargar()
  suscribirCobrosProfesional()
})

watch(() => auth.usuario?.profesional?.id, () => {
  suscribirCobrosProfesional()
})

onBeforeUnmount(() => {
  limpiarSuscripcionCobros()
})
</script>

