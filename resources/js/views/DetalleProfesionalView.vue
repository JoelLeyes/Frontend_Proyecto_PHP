<template>
  <div>
  <div v-if="profesional" class="detalle-profesional">

    <!-- Cabecera -->
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
            <span class="detalle-rating__clasificacion">{{ clasificacionPromedio(profesional.promedio_calificacion) }}</span>
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
        @click="tabActivo = 'servicios'">
        💼 Servicios ({{ profesional.servicios?.length ?? 0 }})
      </button>
      <button
        :class="['detalle-profesional__tab', tabActivo === 'resenas' && 'detalle-profesional__tab--activo']"
        @click="tabActivo = 'resenas'">
        ⭐ Reseñas ({{ resenas.length }})
      </button>
    </div>

    <!-- Tab Servicios -->
    <div v-if="tabActivo === 'servicios'">
      <div v-if="profesional.servicios?.length" class="grilla-servicios">
        <div v-for="servicio in profesional.servicios" :key="servicio.id" class="servicio-det">

          <!-- Info del servicio -->
          <div class="servicio-det__info">
            <p class="tarjeta-servicio__nombre">{{ servicio.nombre }}</p>
            <p class="tarjeta-servicio__descripcion">{{ servicio.descripcion }}</p>
            <div class="tarjeta-servicio__meta">
              <span class="tarjeta-servicio__precio">${{ servicio.precio }}</span>
              <span class="tarjeta-servicio__duracion">⏱ {{ servicio.duracion_minutos }} min</span>
              <span class="tarjeta-servicio__duracion" style="text-transform:capitalize">{{ servicio.modalidad }}</span>
            </div>
          </div>

          <!-- Acciones del servicio -->
          <div class="servicio-det__acciones">
            <button class="boton-principal" @click="abrirReserva(servicio)">Reservar</button>
            <button class="boton-secundario boton-paquetes"
              @click="togglePaquetes(servicio)">
              📦 {{ expandidosPaquetes.has(servicio.id) ? 'Ocultar paquetes' : 'Ver paquetes' }}
            </button>
          </div>

          <!-- Sección paquetes del servicio -->
          <div v-if="expandidosPaquetes.has(servicio.id)" class="paquetes-disponibles">
            <div v-if="cargandoPaquetes.has(servicio.id)" class="cargando" style="padding:.75rem">
              Cargando paquetes...
            </div>
            <template v-else>
              <div v-if="paquetesPorServicio[servicio.id]?.length" class="paquetes-lista">
                <p class="paquetes-lista__titulo">Paquetes disponibles</p>
                <div v-for="pq in paquetesPorServicio[servicio.id]" :key="pq.id" class="paquete-item">
                  <div class="paquete-item__info">
                    <strong>{{ pq.nombre }}</strong>
                    <span class="paquete-item__sesiones">{{ pq.cantidad_sesiones }} sesiones</span>
                    <span class="paquete-item__precio">${{ pq.precio }}</span>
                    <span class="paquete-item__ahorro">
                      (${{ (pq.precio / pq.cantidad_sesiones).toFixed(2) }}/sesión)
                    </span>
                    <p v-if="pq.descripcion" class="paquete-item__desc">{{ pq.descripcion }}</p>
                  </div>
                  <button class="boton-principal boton-sm" @click="abrirCompra(pq)">
                    Comprar paquete
                  </button>
                </div>
              </div>
              <div v-else class="paquetes-vacio">
                Este servicio no tiene paquetes disponibles.
              </div>
            </template>
          </div>

        </div>
      </div>
      <div v-else class="estado-vacio">
        <div class="estado-vacio__icono">💼</div>
        <p>Este profesional no tiene servicios publicados aún.</p>
      </div>
    </div>

    <!-- Tab Reseñas -->
    <div v-if="tabActivo === 'resenas'">
      <!-- Selector de servicio (si hay múltiples servicios) -->
      <div v-if="profesional.servicios?.length > 1" class="resenas-filtro">
        <label class="resenas-filtro__label">Filtrar por servicio:</label>
        <select v-model="servicioSeleccionado" @change="cargarResenas" class="resenas-filtro__select">
          <option :value="null">Todas las reseñas</option>
          <option v-for="srv in profesional.servicios" :key="srv.id" :value="srv.id">
            {{ srv.nombre }}
          </option>
        </select>
      </div>

      <div v-if="cargandoResenas" class="cargando" style="padding:2rem">
        Cargando reseñas...
      </div>

      <template v-else-if="resenas.length">
        <div class="grilla-resenas">
          <div v-for="resena in resenas" :key="resena.id" class="tarjeta-resena">
            <div class="tarjeta-resena__encabezado">
              <div class="tarjeta-resena__estrellas">
                {{ '⭐'.repeat(resena.calificacion) }}{{ '☆'.repeat(5 - resena.calificacion) }}
              </div>
              <p class="tarjeta-resena__servicio">{{ resena.reserva?.servicio?.nombre }}</p>
            </div>
            <p class="tarjeta-resena__comentario">{{ resena.comentario }}</p>
            <p class="tarjeta-resena__autor">— {{ resena.evaluador?.name }}</p>
          </div>
        </div>
      </template>

      <div v-else class="estado-vacio">
        <div class="estado-vacio__icono">💬</div>
        <p v-if="servicioSeleccionado">
          No hay reseñas para este servicio todavía.
        </p>
        <p v-else>
          Todavía no hay reseñas para este profesional.
        </p>
      </div>
    </div>

  </div>
  <div v-else class="cargando">Cargando perfil...</div>

  <!-- ══ Modal de reserva ══ -->
  <Teleport to="body">
    <div v-if="modal.abierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal" role="dialog" aria-modal="true">

        <div class="modal__cabecera">
          <div>
            <h3 class="modal__titulo">Reservar turno</h3>
            <p class="modal__subtitulo">{{ modal.servicio?.nombre }}</p>
          </div>
          <button class="modal__cerrar" @click="cerrarModal" aria-label="Cerrar">✕</button>
        </div>

        <div class="modal__cuerpo">
          <!-- Fecha -->
          <div class="campo">
            <label>Fecha</label>
            <input type="date" v-model="modal.fecha" :min="hoy" @change="cargarSlots" />
          </div>

          <div v-if="modal.cargandoSlots" class="cargando" style="padding:1.5rem">
            Buscando horarios disponibles...
          </div>

          <template v-else-if="modal.fecha">
            <div v-if="modal.slots.length">
              <p class="slots-titulo">Horarios disponibles</p>
              <div class="slots-grilla">
                <button v-for="slot in modal.slots" :key="slot.inicio"
                  :class="['slot-btn', modal.slotSeleccionado === slot.inicio && 'slot-btn--activo']"
                  @click="modal.slotSeleccionado = slot.inicio">
                  {{ slot.inicio.slice(11, 16) }}
                </button>
              </div>
            </div>
            <div v-else class="alerta alerta--info" style="margin-top:.5rem">
              No hay horarios disponibles para esta fecha. Probá con otro día.
            </div>
          </template>

          <!-- Modalidad -->
          <div class="campo" style="margin-top:1rem">
            <label>Modalidad</label>
            <template v-if="modal.servicio?.modalidad === 'hibrida'">
              <select v-model="modal.modalidad">
                <option value="presencial">Presencial</option>
                <option value="remota">Remota (videollamada)</option>
              </select>
            </template>
            <template v-else>
              <input
                :value="modal.servicio?.modalidad === 'remota' ? 'Remota (videollamada)' : 'Presencial'"
                disabled
                class="campo-deshabilitado"
              />
              <small class="campo-ayuda">Este servicio es solo {{ modal.servicio?.modalidad }}.</small>
            </template>
          </div>

          <div
            v-if="modal.servicio?.modalidad !== 'remota' && (modal.servicio?.ubicacion || (profesional.latitud && profesional.longitud))"
            class="campo"
          >
            <label>Ubicación del encuentro</label>
            <MapaUbicacion
              :latitud="modal.servicio?.ubicacion?.latitud ?? profesional.latitud"
              :longitud="modal.servicio?.ubicacion?.longitud ?? profesional.longitud"
              :subtitulo="modal.servicio?.ubicacion?.direccion || profesional.direccion || 'Punto fijado por el profesional'"
              height="220px"
            />
            <small class="campo-ayuda">Este es el punto presencial donde se realizará el servicio.</small>
          </div>

          <!-- Usar paquete (si el cliente tiene paquetes activos para este servicio) -->
          <div v-if="auth.estaLogueado && auth.usuario?.rol === 'cliente' && paquetesParaServicio.length" class="campo">
            <label>Usar paquete de sesiones</label>
            <div class="paquetes-seleccion">
              <button
                :class="['paquete-sel-btn', modal.paqueteClienteId === null && 'paquete-sel-btn--activo']"
                @click="modal.paqueteClienteId = null">
                Sin paquete (sesión individual)
              </button>
              <button v-for="p in paquetesParaServicio" :key="p.id"
                :class="['paquete-sel-btn', modal.paqueteClienteId === p.id && 'paquete-sel-btn--activo']"
                @click="modal.paqueteClienteId = p.id">
                {{ p.paquete_servicio?.nombre }}
                <span class="paquete-sel-btn__resto">
                  ({{ p.sesiones_total - p.sesiones_usadas }} restantes)
                </span>
              </button>
            </div>
            <small class="campo-ayuda">Si usás un paquete, se descuenta una sesión al confirmar.</small>
          </div>

          <!-- Notas -->
          <div class="campo">
            <label>Notas para el profesional <span style="font-weight:400;text-transform:none">(opcional)</span></label>
            <textarea v-model="modal.notas" placeholder="Ej: primera consulta, tengo alergia a..." rows="2"></textarea>
          </div>

          <p v-if="modal.error" class="alerta alerta--error">{{ modal.error }}</p>
          <p v-if="modal.exito" class="alerta alerta--exito">{{ modal.exito }}</p>
        </div>

        <div class="modal__pie">
          <button class="boton-secundario" @click="cerrarModal">Cancelar</button>
          <button class="boton-principal"
            :disabled="!modal.slotSeleccionado || modal.enviando"
            @click="confirmarReserva">
            {{ modal.enviando ? 'Reservando...' : 'Confirmar reserva' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ══ Modal comprar paquete ══ -->
  <Teleport to="body">
    <div v-if="modalCompra.abierto" class="modal-overlay" @click.self="modalCompra.abierto = false">
      <div class="modal">
        <div class="modal__cabecera">
          <h3 class="modal__titulo">Comprar paquete</h3>
          <button class="modal__cerrar" @click="modalCompra.abierto = false">✕</button>
        </div>
        <div class="modal__cuerpo">
          <div class="compra-resumen">
            <p class="compra-resumen__nombre">{{ modalCompra.paquete?.nombre }}</p>
            <div class="compra-resumen__detalle">
              <span>{{ modalCompra.paquete?.cantidad_sesiones }} sesiones</span>
              <span class="compra-resumen__precio">${{ modalCompra.paquete?.precio }}</span>
            </div>
            <p v-if="modalCompra.paquete?.descripcion" class="compra-resumen__desc">
              {{ modalCompra.paquete.descripcion }}
            </p>
            <p class="compra-resumen__por-sesion">
              Equivale a ${{ modalCompra.paquete ? (modalCompra.paquete.precio / modalCompra.paquete.cantidad_sesiones).toFixed(2) : '' }} por sesión
            </p>
          </div>

          <!-- Paso 1: reservar + iniciar pago -->
          <template v-if="modalCompra.paso === 'confirmacion'">
            <p v-if="modalCompra.error" class="alerta alerta--error">{{ modalCompra.error }}</p>
            <div class="modal__pie" style="border:none;padding:0;margin-top:1rem">
              <button class="boton-secundario" @click="modalCompra.abierto = false">Cancelar</button>
              <button class="boton-principal" :disabled="modalCompra.enviando" @click="iniciarCompra">
                {{ modalCompra.enviando ? 'Preparando pago...' : 'Pagar con PayPal' }}
              </button>
            </div>
          </template>

          <!-- Paso 2: botones PayPal -->
          <template v-else-if="modalCompra.paso === 'pago'">
            <BotonPago
              tipo="paquete"
              :entidad-id="modalCompra.paqueteClienteId"
              @pagado="onCompraExitosa"
            />
          </template>

          <!-- Paso 3: éxito -->
          <p v-else-if="modalCompra.paso === 'exito'" class="alerta alerta--exito">
            ✅ ¡Paquete adquirido! Lo encontrás en "Mis paquetes".
          </p>
        </div>
      </div>
    </div>
  </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notificationStore'
import { getEcho } from '@/services/echo'
import axios from 'axios'
import MapaUbicacion from '@/components/MapaUbicacion.vue'
import BotonPago from '@/components/BotonPago.vue'

const ruta        = useRoute()
const enrutador   = useRouter()
const auth        = useAuthStore()
const notif       = useNotificationStore()
const profesional = ref(null)
const resenas     = ref([])
const tabActivo   = ref('servicios')
const servicioSeleccionado = ref(null)
const cargandoResenas = ref(false)

const hoy = new Date().toISOString().slice(0, 10)

const iniciales = computed(() => {
  const nombre = profesional.value?.usuario?.name || ''
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

function clasificacionPromedio(promedio) {
  if (promedio >= 4.6) return 'Excelente'
  if (promedio >= 4.1) return 'Muy bueno'
  if (promedio >= 3.1) return 'Bueno'
  if (promedio >= 2.1) return 'Regular'
  return 'A mejorar'
}

// ── Paquetes del servicio (los que ofrece el profesional) ─────────────────────
const expandidosPaquetes  = reactive(new Set())
const paquetesPorServicio = reactive({})
const cargandoPaquetes    = reactive(new Set())
const suscripcionesPaquetes = reactive(new Map())
const solicitudesPaquetes = new Map()

// Paquetes del cliente para el servicio actual (para usarlos en la reserva)
const paquetesParaServicio = ref([])

async function cargarPaquetesServicio(servicio, forzar = false) {
  if (!forzar && paquetesPorServicio[servicio.id]) return

  const solicitudActual = (solicitudesPaquetes.get(servicio.id) || 0) + 1
  solicitudesPaquetes.set(servicio.id, solicitudActual)

  cargandoPaquetes.add(servicio.id)
  try {
    const { data } = await axios.get(
      `/api/profesionales/${ruta.params.id}/servicios/${servicio.id}/paquetes`
    )
    if (solicitudesPaquetes.get(servicio.id) === solicitudActual) {
      paquetesPorServicio[servicio.id] = data
    }
  } finally {
    if (solicitudesPaquetes.get(servicio.id) === solicitudActual) {
      cargandoPaquetes.delete(servicio.id)
    }
  }
}

function suscribirPaquetesServicio(servicioId) {
  const echo = getEcho()
  const id = Number(servicioId)
  if (!echo || !id || suscripcionesPaquetes.has(id)) return

  const canal = `servicios.${id}.paquetes`
  suscripcionesPaquetes.set(id, canal)

  echo.channel(canal).listen('.paquete.servicio.actualizado', () => {
    const servicio = profesional.value?.servicios?.find(s => Number(s.id) === id)
    if (!servicio) return

    if (!expandidosPaquetes.has(id) && !paquetesPorServicio[id]) return

    cargarPaquetesServicio(servicio, true)
  })
}

function sincronizarSuscripcionesPaquetes() {
  if (!getEcho()) return

  for (const servicioId of Object.keys(paquetesPorServicio)) {
    suscribirPaquetesServicio(servicioId)
  }

  for (const servicioId of expandidosPaquetes) {
    suscribirPaquetesServicio(servicioId)
  }
}

function limpiarSuscripcionesPaquetes() {
  const echo = getEcho()
  if (echo) {
    for (const canal of suscripcionesPaquetes.values()) {
      try {
        echo.leave(canal)
      } catch (error) {
        console.warn('No se pudo salir del canal de paquetes.', error)
      }
    }
  }

  suscripcionesPaquetes.clear()
}

async function togglePaquetes(servicio) {
  if (expandidosPaquetes.has(servicio.id)) {
    expandidosPaquetes.delete(servicio.id)
    return
  }
  expandidosPaquetes.add(servicio.id)

  await cargarPaquetesServicio(servicio)
  suscribirPaquetesServicio(servicio.id)
}

// ── Modal de reserva ──────────────────────────────────────────────────────────
const modal = ref({
  abierto: false, servicio: null, fecha: '', slots: [],
  slotSeleccionado: null, modalidad: 'remota', notas: '',
  paqueteClienteId: null,
  cargandoSlots: false, enviando: false, error: '', exito: '',
})

async function abrirReserva(servicio) {
  if (!auth.estaLogueado) {
    enrutador.push({ name: 'iniciar-sesion' })
    return
  }
  const modalidadInicial = servicio.modalidad === 'hibrida' ? 'presencial' : (servicio.modalidad || 'presencial')
  modal.value = {
    abierto: true, servicio, fecha: '', slots: [],
    slotSeleccionado: null, modalidad: modalidadInicial,
    notas: '', paqueteClienteId: null,
    cargandoSlots: false, enviando: false, error: '', exito: '',
  }

  // Cargar paquetes activos del cliente para este servicio
  paquetesParaServicio.value = []
  if (auth.usuario?.rol === 'cliente') {
    try {
      const { data } = await axios.get('/api/mis-paquetes', {
        params: { servicio_id: servicio.id, estado: 'activo' }
      })
      paquetesParaServicio.value = data
    } catch { /* silencioso */ }
  }
}

function cerrarModal() { modal.value.abierto = false }

async function cargarSlots() {
  if (!modal.value.fecha) return
  modal.value.slots = []; modal.value.slotSeleccionado = null; modal.value.cargandoSlots = true
  try {
    const { data } = await axios.get(
      `/api/profesionales/${ruta.params.id}/disponibilidad/horarios`,
      { params: { fecha: modal.value.fecha, servicio_id: modal.value.servicio.id } }
    )
    modal.value.slots = data
  } catch {
    modal.value.slots = []
  } finally {
    modal.value.cargandoSlots = false
  }
}

async function confirmarReserva() {
  modal.value.error = ''; modal.value.exito = ''; modal.value.enviando = true
  try {
    await axios.post('/api/reservas', {
      servicio_id:        modal.value.servicio.id,
      fecha_hora:         modal.value.slotSeleccionado,
      modalidad:          modal.value.modalidad,
      notas:              modal.value.notas || null,
      paquete_cliente_id: modal.value.paqueteClienteId || null,
    })
    modal.value.exito = '✅ ¡Reserva creada! Te redirigimos a tus reservas...'
    setTimeout(() => {
      cerrarModal()
      enrutador.push({ name: 'mis-reservas' })
    }, 1800)
  } catch (e) {
    modal.value.error = e.response?.data?.error || 'No se pudo crear la reserva. Intentá nuevamente.'
  } finally {
    modal.value.enviando = false
  }
}

// ── Modal compra de paquete ───────────────────────────────────────────────────
const modalCompra = ref({
  abierto: false, paquete: null, paqueteClienteId: null,
  paso: 'confirmacion', enviando: false, error: '',
})

function abrirCompra(paquete) {
  if (!auth.estaLogueado) {
    enrutador.push({ name: 'iniciar-sesion' })
    return
  }
  if (auth.usuario?.rol !== 'cliente') {
    notif.error('Solo los clientes pueden adquirir paquetes.')
    return
  }
  modalCompra.value = {
    abierto: true, paquete, paqueteClienteId: null,
    paso: 'confirmacion', enviando: false, error: '',
  }
}

async function iniciarCompra() {
  modalCompra.value.error = ''; modalCompra.value.enviando = true
  try {
    const { data } = await axios.post(`/api/paquetes-servicio/${modalCompra.value.paquete.id}/comprar`)
    modalCompra.value.paqueteClienteId = data.id
    modalCompra.value.paso = 'pago'
  } catch (e) {
    modalCompra.value.error = e.response?.data?.error || 'No se pudo iniciar la compra.'
  } finally {
    modalCompra.value.enviando = false
  }
}

function onCompraExitosa() {
  modalCompra.value.paso = 'exito'
  setTimeout(() => { modalCompra.value.abierto = false }, 2500)
}

// ── Carga de reseñas (con filtro opcional por servicio) ────────────────────────
async function cargarResenas() {
  cargandoResenas.value = true
  try {
    const params = {}
    if (servicioSeleccionado.value) {
      params.servicio_id = servicioSeleccionado.value
    }
    const { data } = await axios.get(`/api/profesionales/${ruta.params.id}/resenas`, { params })
    resenas.value = data.data || []
  } catch (error) {
    console.error('Error cargando reseñas:', error)
    resenas.value = []
  } finally {
    cargandoResenas.value = false
  }
}

// ── Carga inicial ─────────────────────────────────────────────────────────────
async function cargarDatos() {
  try {
    const { data } = await axios.get(`/api/profesionales/${ruta.params.id}`)
    profesional.value = data
    await cargarResenas()
  } catch (error) {
    console.error('Error cargando profesional:', error)
  }
}

onMounted(() => {
  cargarDatos()
  sincronizarSuscripcionesPaquetes()
})

watch(() => auth.usuario?.id, () => {
  sincronizarSuscripcionesPaquetes()
})

onBeforeUnmount(() => {
  limpiarSuscripcionesPaquetes()
})
</script>

