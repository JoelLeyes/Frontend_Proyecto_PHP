<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">
        {{ esProfesional ? 'Reservas recibidas' : 'Mis Reservas' }}
      </h1>
    </div>

    <!-- Filtros -->
    <div class="reservas-filtros">
      <button
        v-for="tab in TABS" :key="tab.valor"
        :class="['tab-btn', filtroEstado === tab.valor && 'tab-btn--activo']"
        @click="cambiarTab(tab.valor)"
      >
        {{ tab.label }}
        <span v-if="tab.valor === 'pendiente' && totalPendientes" class="tab-badge">
          {{ totalPendientes }}
        </span>
      </button>
    </div>

    <!-- Cargando -->
    <div v-if="store.cargando" class="cargando" style="padding:3rem">Cargando reservas...</div>

    <!-- Tabla -->
    <div v-else-if="store.reservas.length" class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr>
            <th>Servicio</th>
            <th v-if="esProfesional">Cliente</th>
            <th v-else>Profesional</th>
            <th>Fecha y hora</th>
            <th>Modalidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reserva in store.reservas" :key="reserva.id">
            <td><strong>{{ reserva.servicio?.nombre }}</strong></td>
            <td v-if="esProfesional">{{ reserva.cliente?.name || '—' }}</td>
            <td v-else>{{ reserva.profesional?.name || '—' }}</td>
            <td class="td-fecha">{{ formatearFecha(reserva.fecha_hora) }}</td>
            <td style="text-transform:capitalize">{{ reserva.modalidad }}</td>
            <td>
              <span :class="['insignia', insigniaEstado(reserva.estado)]">
                {{ etiquetaEstado(reserva.estado) }}
              </span>
            </td>
            <td>
              <div class="acciones-fila">
                <!-- PROFESIONAL: confirmar -->
                <button
                  v-if="esProfesional && reserva.estado === 'pendiente'"
                  class="boton-principal boton-xs"
                  :disabled="procesando === reserva.id"
                  @click="confirmar(reserva)"
                >
                  ✓ Confirmar
                </button>

                <!-- PROFESIONAL o CLIENTE: reprogramar -->
                <button
                  v-if="puedeReprogramarse(reserva)"
                  class="boton-secundario boton-xs"
                  :disabled="procesando === reserva.id"
                  @click="abrirReprogramar(reserva)"
                >
                  📅 Reprogramar
                </button>

                <!-- CLIENTE: reseñar cuando ya finalizó -->
                <button
                  v-if="puedeResenarse(reserva)"
                  class="boton-secundario boton-xs"
                  @click="abrirResena(reserva)"
                >
                  ⭐ Reseñar
                </button>

                <!-- Videollamada (reservas remotas confirmadas o pagadas) -->
                <RouterLink
                  v-if="puedeVideollamada(reserva)"
                  :to="{ name: 'sesion-video', params: { id: reserva.id } }"
                  class="boton-principal boton-xs"
                >
                  📹 Unirse
                </RouterLink>

                <!-- CLIENTE: pagar reserva confirmada sin paquete -->
                <button
                  v-if="puedePagar(reserva)"
                  class="boton-principal boton-xs"
                  @click="abrirPago(reserva)"
                >
                  💳 Pagar
                </button>

                <!-- CLIENTE: ver ubicación de reserva presencial pagada -->
                <button
                  v-if="puedeVerUbicacion(reserva)"
                  class="boton-secundario boton-xs"
                  @click="abrirUbicacion(reserva)"
                >
                  📍 Ubicación
                </button>

                <!-- PROFESIONAL: finalizar manualmente -->
                <button
                  v-if="puedeFinalizarse(reserva)"
                  class="boton-secundario boton-xs"
                  :disabled="procesando === reserva.id"
                  @click="finalizar(reserva)"
                >
                  ✓ Finalizar
                </button>

                <!-- PROFESIONAL o CLIENTE: cancelar -->
                <button
                  v-if="puedeCancelarse(reserva)"
                  class="boton-peligro boton-xs"
                  :disabled="procesando === reserva.id"
                  @click="abrirCancelar(reserva)"
                >
                  ✕ Cancelar
                </button>

                <span v-if="!tieneAcciones(reserva)" class="sin-acciones">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="store.paginacion?.last_page > 1" class="paginacion">
        <button
          v-for="p in store.paginacion.last_page" :key="p"
          :class="['paginacion__btn', p === store.paginacion.current_page && 'paginacion__btn--activo']"
          @click="cargarPagina(p)"
        >{{ p }}</button>
      </div>
    </div>

    <!-- Vacío -->
    <div v-else class="estado-vacio">
      <div class="estado-vacio__icono">📅</div>
      <h3>Sin reservas{{ filtroEstado ? ' en este estado' : '' }}</h3>
      <p v-if="!esProfesional">Cuando reserves un turno, aparecerá aquí.</p>
      <RouterLink v-if="!esProfesional" :to="{ name: 'profesionales' }" class="boton-principal" style="margin-top:1rem">
        Buscar profesionales
      </RouterLink>
    </div>

    <!-- ══ Modal cancelar ══ -->
    <Teleport to="body">
      <div v-if="modalCancelar.abierto" class="modal-overlay" @click.self="modalCancelar.abierto = false">
        <div class="modal">
          <div class="modal__cabecera">
            <h3 class="modal__titulo">Cancelar reserva</h3>
            <button class="modal__cerrar" @click="modalCancelar.abierto = false">✕</button>
          </div>
          <div class="modal__cuerpo">
            <p style="margin-bottom:1rem;font-size:.9375rem">
              <strong>{{ modalCancelar.reserva?.servicio?.nombre }}</strong><br>
              <span style="color:var(--color-texto-suave)">{{ formatearFecha(modalCancelar.reserva?.fecha_hora) }}</span>
            </p>
            <div class="campo">
              <label>Motivo <span style="font-weight:400">(opcional)</span></label>
              <textarea v-model="modalCancelar.motivo" rows="2" placeholder="Ej: surgió un imprevisto, reagendar para la semana que viene..."></textarea>
            </div>
            <p v-if="modalCancelar.error" class="alerta alerta--error">{{ modalCancelar.error }}</p>
          </div>
          <div class="modal__pie">
            <button class="boton-secundario" @click="modalCancelar.abierto = false">Volver</button>
            <button class="boton-principal" style="background:linear-gradient(135deg,#dc2626,#b91c1c)" :disabled="modalCancelar.enviando" @click="confirmarCancelar">
              {{ modalCancelar.enviando ? 'Cancelando...' : 'Confirmar cancelación' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ Modal reprogramar ══ -->
    <Teleport to="body">
      <div v-if="modalReprogramar.abierto" class="modal-overlay" @click.self="modalReprogramar.abierto = false">
        <div class="modal">
          <div class="modal__cabecera">
            <div>
              <h3 class="modal__titulo">Reprogramar reserva</h3>
              <p class="modal__subtitulo">{{ modalReprogramar.reserva?.servicio?.nombre }}</p>
            </div>
            <button class="modal__cerrar" @click="modalReprogramar.abierto = false">✕</button>
          </div>
          <div class="modal__cuerpo">
            <div class="campo">
              <label>Nueva fecha</label>
              <input type="date" v-model="modalReprogramar.fecha" :min="hoy" @change="cargarSlotsReprogramar" />
            </div>

            <div v-if="modalReprogramar.cargandoSlots" class="cargando" style="padding:1rem">
              Buscando horarios...
            </div>

            <template v-else-if="modalReprogramar.fecha">
              <div v-if="modalReprogramar.slots.length">
                <p class="slots-titulo">Horarios disponibles</p>
                <div class="slots-grilla">
                  <button
                    v-for="slot in modalReprogramar.slots" :key="slot.inicio"
                    :class="['slot-btn', modalReprogramar.slotSeleccionado === slot.inicio && 'slot-btn--activo']"
                    @click="modalReprogramar.slotSeleccionado = slot.inicio"
                  >{{ slot.inicio.slice(11, 16) }}</button>
                </div>
              </div>
              <div v-else class="alerta alerta--info" style="margin-top:.5rem">
                No hay horarios disponibles para esta fecha.
              </div>
            </template>

            <p v-if="modalReprogramar.error" class="alerta alerta--error">{{ modalReprogramar.error }}</p>
          </div>
          <div class="modal__pie">
            <button class="boton-secundario" @click="modalReprogramar.abierto = false">Cancelar</button>
            <button class="boton-principal" :disabled="!modalReprogramar.slotSeleccionado || modalReprogramar.enviando" @click="confirmarReprogramar">
              {{ modalReprogramar.enviando ? 'Guardando...' : 'Confirmar nueva fecha' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ Modal reseñar ══ -->
    <Teleport to="body">
      <div v-if="modalResena.abierto" class="modal-overlay" @click.self="modalResena.abierto = false">
        <div class="modal">
          <div class="modal__cabecera">
            <div>
              <h3 class="modal__titulo">Dejar reseña</h3>
              <p class="modal__subtitulo">{{ modalResena.reserva?.servicio?.nombre }}</p>
            </div>
            <button class="modal__cerrar" @click="modalResena.abierto = false">✕</button>
          </div>

          <div class="modal__cuerpo">
            <div class="campo">
              <label>Calificación</label>
              <div class="selector-estrellas">
                <button
                  v-for="estrella in 5"
                  :key="estrella"
                  type="button"
                  :class="['estrella-btn', modalResena.calificacion >= estrella && 'estrella-btn--activo']"
                  @click="modalResena.calificacion = estrella"
                >
                  ⭐
                </button>
              </div>
            </div>

            <div class="campo">
              <label>Comentario <span style="font-weight:400">(opcional)</span></label>
              <textarea v-model="modalResena.comentario" rows="3" placeholder="Contá cómo fue tu experiencia..."></textarea>
            </div>

            <p v-if="modalResena.error" class="alerta alerta--error">{{ modalResena.error }}</p>
            <p v-if="modalResena.exito" class="alerta alerta--exito">{{ modalResena.exito }}</p>
          </div>

          <div class="modal__pie">
            <button class="boton-secundario" @click="modalResena.abierto = false">Cancelar</button>
            <button class="boton-principal" :disabled="modalResena.enviando || !modalResena.calificacion" @click="confirmarResena">
              {{ modalResena.enviando ? 'Enviando...' : 'Publicar reseña' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ Modal ubicación ══ -->
    <Teleport to="body">
      <div v-if="modalUbicacion.abierto" class="modal-overlay" @click.self="modalUbicacion.abierto = false">
        <div class="modal">
          <div class="modal__cabecera">
            <div>
              <h3 class="modal__titulo">Lugar del encuentro</h3>
              <p class="modal__subtitulo">{{ modalUbicacion.reserva?.servicio?.nombre }}</p>
            </div>
            <button class="modal__cerrar" @click="modalUbicacion.abierto = false">✕</button>
          </div>
          <div class="modal__cuerpo">
            <p style="margin-bottom:.75rem;font-size:.9375rem;color:var(--color-texto-suave)">
              {{ formatearFecha(modalUbicacion.reserva?.fecha_hora) }}
            </p>
            <MapaUbicacion
              v-if="modalUbicacion.reserva?.servicio?.ubicacion"
              :latitud="modalUbicacion.reserva.servicio.ubicacion.latitud"
              :longitud="modalUbicacion.reserva.servicio.ubicacion.longitud"
              :subtitulo="modalUbicacion.reserva.servicio.ubicacion.direccion || 'Punto fijado por el profesional'"
              height="260px"
            />
          </div>
          <div class="modal__pie">
            <button class="boton-secundario" @click="modalUbicacion.abierto = false">Cerrar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ Modal pagar ══ -->
    <Teleport to="body">
      <div v-if="modalPago.abierto" class="modal-overlay" @click.self="modalPago.abierto = false">
        <div class="modal">
          <div class="modal__cabecera">
            <div>
              <h3 class="modal__titulo">Pagar reserva</h3>
              <p class="modal__subtitulo">{{ modalPago.reserva?.servicio?.nombre }}</p>
            </div>
            <button class="modal__cerrar" @click="modalPago.abierto = false">✕</button>
          </div>
          <div class="modal__cuerpo">
            <p style="margin-bottom:1rem;font-size:.9375rem;color:var(--color-texto-suave)">
              {{ formatearFecha(modalPago.reserva?.fecha_hora) }}
            </p>
            <BotonPago
              v-if="modalPago.reserva"
              tipo="reserva"
              :entidad-id="modalPago.reserva.id"
              @pagado="pagoExitoso"
            />
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useReservasStore } from '@/stores/reservas'
import BotonPago from '@/components/BotonPago.vue'
import MapaUbicacion from '@/components/MapaUbicacion.vue'
import axios from 'axios'

const auth  = useAuthStore()
const store = useReservasStore()

const esProfesional  = computed(() => auth.usuario?.rol === 'profesional')
const filtroEstado   = ref('')
const procesando     = ref(null)
const hoy            = new Date().toISOString().slice(0, 10)

const TABS = [
  { valor: '',           label: 'Todas' },
  { valor: 'pendiente',  label: 'Pendientes' },
  { valor: 'confirmada', label: 'Confirmadas' },
  { valor: 'finalizada', label: 'Finalizadas' },
  { valor: 'cancelada',  label: 'Canceladas' },
]

const totalPendientes = computed(() =>
  store.reservas.filter(r => r.estado === 'pendiente').length
)

// ── Helpers de estado ─────────────────────────────────────────────────────────
const ETIQUETAS = { pendiente: 'Pendiente', confirmada: 'Confirmada', pagada: 'Pagada', en_curso: 'En curso', finalizada: 'Finalizada', cancelada: 'Cancelada', no_asistida: 'No asistió' }
const INSIGNIAS = { pendiente: 'insignia--pendiente', confirmada: 'insignia--confirmada', pagada: 'insignia--pagada', en_curso: 'insignia--en-curso', finalizada: 'insignia--finalizada', cancelada: 'insignia--cancelada', no_asistida: 'insignia--cancelada' }

function etiquetaEstado(e) { return ETIQUETAS[e] || e }
function insigniaEstado(e) { return INSIGNIAS[e] || '' }

function formatearFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleString('es-UY', { dateStyle: 'medium', timeStyle: 'short' })
}

function puedeCancelarse(r)    { return ['pendiente', 'confirmada', 'pagada'].includes(r.estado) }
function puedeReprogramarse(r) { return ['pendiente', 'confirmada'].includes(r.estado) }
function puedeResenarse(r)     { return r.estado === 'finalizada' && !r.resena && !esProfesional.value }
function puedeVideollamada(r)  { return r.modalidad === 'remota' && ['confirmada', 'pagada', 'en_curso'].includes(r.estado) }
function puedePagar(r)         { return !esProfesional.value && r.estado === 'confirmada' && !r.paquete_cliente_id }
function puedeVerUbicacion(r)  { return !esProfesional.value && r.modalidad === 'presencial' && ['pagada', 'en_curso', 'finalizada'].includes(r.estado) && r.servicio?.ubicacion }
function puedeFinalizarse(r)   { return esProfesional.value && ['confirmada', 'pagada', 'en_curso'].includes(r.estado) }
function tieneAcciones(r) {
  return puedeCancelarse(r) || puedeReprogramarse(r) || puedeResenarse(r) || puedeVideollamada(r) || puedePagar(r) || puedeVerUbicacion(r) || puedeFinalizarse(r) || (esProfesional.value && r.estado === 'pendiente')
}

// ── Carga ─────────────────────────────────────────────────────────────────────
function cargarReservas(pagina = 1) {
  const params = { page: pagina }
  if (filtroEstado.value) params.estado = filtroEstado.value
  store.obtenerReservas(params)
}

function cambiarTab(valor) {
  filtroEstado.value = valor
  cargarReservas()
}

function cargarPagina(p) { cargarReservas(p) }

// ── Confirmar ─────────────────────────────────────────────────────────────────
async function confirmar(reserva) {
  if (!confirm(`¿Confirmar la reserva de ${reserva.cliente?.name}?`)) return
  procesando.value = reserva.id
  try {
    await store.confirmarReserva(reserva.id)
  } catch (e) {
    alert(e.response?.data?.error || 'No se pudo confirmar.')
  } finally {
    procesando.value = null
  }
}

// ── Finalizar ─────────────────────────────────────────────────────────────────
async function finalizar(reserva) {
  if (!confirm(`¿Marcar como finalizada la reserva de ${reserva.cliente?.name}?`)) return
  procesando.value = reserva.id
  try {
    await store.finalizarReserva(reserva.id)
  } catch (e) {
    alert(e.response?.data?.error || 'No se pudo finalizar la reserva.')
  } finally {
    procesando.value = null
  }
}

// ── Modal cancelar ────────────────────────────────────────────────────────────
const modalCancelar = ref({ abierto: false, reserva: null, motivo: '', enviando: false, error: '' })

function abrirCancelar(reserva) {
  modalCancelar.value = { abierto: true, reserva, motivo: '', enviando: false, error: '' }
}

async function confirmarCancelar() {
  modalCancelar.value.error    = ''
  modalCancelar.value.enviando = true
  try {
    await store.cancelarReserva(modalCancelar.value.reserva.id, modalCancelar.value.motivo)
    modalCancelar.value.abierto = false
  } catch (e) {
    modalCancelar.value.error = e.response?.data?.error || 'No se pudo cancelar la reserva.'
  } finally {
    modalCancelar.value.enviando = false
  }
}

// ── Modal reprogramar ─────────────────────────────────────────────────────────
const modalReprogramar = ref({
  abierto: false, reserva: null, fecha: '', slots: [],
  slotSeleccionado: null, cargandoSlots: false, enviando: false, error: '',
})

function abrirReprogramar(reserva) {
  modalReprogramar.value = {
    abierto: true, reserva, fecha: '', slots: [],
    slotSeleccionado: null, cargandoSlots: false, enviando: false, error: '',
  }
}

async function cargarSlotsReprogramar() {
  const r = modalReprogramar.value
  if (!r.fecha) return
  r.slots = []; r.slotSeleccionado = null; r.cargandoSlots = true

  // Necesitamos el profesional_id y servicio_id de la reserva
  const profesionalId = r.reserva.servicio?.profesional_id
  const servicioId    = r.reserva.servicio_id

  try {
    const { data } = await axios.get(
      `/api/profesionales/${profesionalId}/disponibilidad/horarios`,
      { params: { fecha: r.fecha, servicio_id: servicioId } }
    )
    r.slots = data
  } catch {
    r.slots = []
  } finally {
    r.cargandoSlots = false
  }
}

async function confirmarReprogramar() {
  const r = modalReprogramar.value
  r.error = ''; r.enviando = true
  try {
    await store.reprogramarReserva(r.reserva.id, r.slotSeleccionado)
    r.abierto = false
  } catch (e) {
    r.error = e.response?.data?.error || 'No se pudo reprogramar.'
  } finally {
    r.enviando = false
  }
}

// ── Modal reseña ────────────────────────────────────────────────────────────
const modalResena = ref({
  abierto: false,
  reserva: null,
  calificacion: 0,
  comentario: '',
  enviando: false,
  error: '',
  exito: '',
})

function abrirResena(reserva) {
  modalResena.value = {
    abierto: true,
    reserva,
    calificacion: 0,
    comentario: '',
    enviando: false,
    error: '',
    exito: '',
  }
}

async function confirmarResena() {
  const r = modalResena.value
  r.error = ''
  r.enviando = true
  try {
    await store.crearResena(r.reserva.id, {
      calificacion: r.calificacion,
      comentario: r.comentario || null,
    })
    r.exito = '✅ Tu reseña fue publicada.'
    cargarReservas(store.paginacion?.current_page || 1)
    setTimeout(() => { r.abierto = false }, 900)
  } catch (e) {
    r.error = e.response?.data?.error || 'No se pudo enviar la reseña.'
  } finally {
    r.enviando = false
  }
}

// ── Modal ubicación ───────────────────────────────────────────────────────────
const modalUbicacion = ref({ abierto: false, reserva: null })

function abrirUbicacion(reserva) {
  modalUbicacion.value = { abierto: true, reserva }
}

// ── Modal pagar ───────────────────────────────────────────────────────────────
const modalPago = ref({ abierto: false, reserva: null })

function abrirPago(reserva) {
  modalPago.value = { abierto: true, reserva }
}

async function pagoExitoso() {
  modalPago.value.abierto = false
  cargarReservas(store.paginacion?.current_page || 1)
}

onMounted(() => cargarReservas())
</script>
