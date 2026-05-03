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
      >💼 Servicios ({{ profesional.servicios?.length ?? 0 }})</button>
      <button
        :class="['detalle-profesional__tab', tabActivo === 'resenas' && 'detalle-profesional__tab--activo']"
        @click="tabActivo = 'resenas'"
      >⭐ Reseñas ({{ resenas.length }})</button>
    </div>

    <!-- Tab Servicios -->
    <div v-if="tabActivo === 'servicios'">
      <div v-if="profesional.servicios?.length" class="grilla-servicios">
        <div v-for="servicio in profesional.servicios" :key="servicio.id" class="tarjeta-servicio">
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

    <!-- Tab Reseñas -->
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

  <!-- ===== Modal de reserva ===== -->

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
          <!-- Paso 1: elegir fecha -->
          <div class="campo">
            <label>Fecha</label>
            <input type="date" v-model="modal.fecha" :min="hoy" @change="cargarSlots" />
          </div>

          <!-- Cargando slots -->
          <div v-if="modal.cargandoSlots" class="cargando" style="padding:1.5rem">
            Buscando horarios disponibles...
          </div>

          <!-- Slots disponibles -->
          <template v-else-if="modal.fecha">
            <div v-if="modal.slots.length">
              <p class="slots-titulo">Horarios disponibles</p>
              <div class="slots-grilla">
                <button
                  v-for="slot in modal.slots"
                  :key="slot.inicio"
                  :class="['slot-btn', modal.slotSeleccionado === slot.inicio && 'slot-btn--activo']"
                  @click="modal.slotSeleccionado = slot.inicio"
                >
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
            <select v-model="modal.modalidad">
              <option value="remota">Remota (videollamada)</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>

          <!-- Notas opcionales -->
          <div class="campo">
            <label>Notas para el profesional <span style="font-weight:400;text-transform:none">(opcional)</span></label>
            <textarea v-model="modal.notas" placeholder="Ej: primera consulta, tengo alergia a..." rows="2"></textarea>
          </div>

          <p v-if="modal.error" class="alerta alerta--error">{{ modal.error }}</p>
          <p v-if="modal.exito" class="alerta alerta--exito">{{ modal.exito }}</p>
        </div>

        <div class="modal__pie">
          <button class="boton-secundario" @click="cerrarModal">Cancelar</button>
          <button
            class="boton-principal"
            :disabled="!modal.slotSeleccionado || modal.enviando"
            @click="confirmarReserva"
          >
            {{ modal.enviando ? 'Reservando...' : 'Confirmar reserva' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const ruta        = useRoute()
const enrutador   = useRouter()
const auth        = useAuthStore()
const profesional = ref(null)
const resenas     = ref([])
const tabActivo   = ref('servicios')

const hoy = new Date().toISOString().slice(0, 10)

const iniciales = computed(() => {
  const nombre = profesional.value?.usuario?.name || ''
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

// ── Estado del modal ──────────────────────────────────────────────────────────
const modal = ref({
  abierto:          false,
  servicio:         null,
  fecha:            '',
  slots:            [],
  slotSeleccionado: null,
  modalidad:        'remota',
  notas:            '',
  cargandoSlots:    false,
  enviando:         false,
  error:            '',
  exito:            '',
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
  if (!auth.estaLogueado) {
    enrutador.push({ name: 'iniciar-sesion' })
    return
  }
  modal.value = {
    abierto:          true,
    servicio,
    fecha:            '',
    slots:            [],
    slotSeleccionado: null,
    modalidad:        servicio.modalidad || 'remota',
    notas:            '',
    cargandoSlots:    false,
    enviando:         false,
    error:            '',
    exito:            '',
  }
}

function cerrarModal() {
  modal.value.abierto = false
}

async function cargarSlots() {
  if (!modal.value.fecha) return
  modal.value.slots            = []
  modal.value.slotSeleccionado = null
  modal.value.cargandoSlots    = true
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
  modal.value.error   = ''
  modal.value.exito   = ''
  modal.value.enviando = true
  try {
    await axios.post('/api/reservas', {
      servicio_id: modal.value.servicio.id,
      fecha_hora:  modal.value.slotSeleccionado,
      modalidad:   modal.value.modalidad,
      notas:       modal.value.notas || null,
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

onMounted(cargarDatos)
</script>

<style scoped>
.detalle-avatar {
  width: 110px; height: 110px;
  border-radius: 50%; overflow: hidden; flex-shrink: 0;
  border: 3px solid var(--color-primario-claro);
  box-shadow: var(--sombra-media);
}
.detalle-avatar img { width: 100%; height: 100%; object-fit: cover; }
.detalle-avatar__defecto {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--color-primario), var(--color-primario-oscuro));
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 700;
}
.detalle-info h1       { font-size: 1.625rem; margin-bottom: .25rem; }
.detalle-info__nombre  { color: var(--color-texto-suave); font-size: .9375rem; margin-bottom: .375rem; }
.detalle-info__ubicacion{ color: var(--color-texto-suave); font-size: .875rem; margin-bottom: .625rem; }
.detalle-info__meta    { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: .875rem; }
.detalle-rating        { font-size: .9375rem; font-weight: 600; color: var(--color-advertencia); }
.detalle-rating__total { font-size: .8125rem; color: var(--color-texto-suave); font-weight: 400; }
.detalle-info__bio     { font-size: .9375rem; color: var(--color-texto-suave); line-height: 1.6; max-width: 600px; margin-bottom: 0; }
.modalidad-chip {
  display: inline-block; padding: .2rem .75rem;
  background: var(--color-primario-claro); color: var(--color-primario-oscuro);
  border-radius: 9999px; font-size: .8125rem; font-weight: 600; text-transform: capitalize;
}
.estado-vacio { text-align: center; padding: 3rem; color: var(--color-texto-suave); }
.estado-vacio__icono { font-size: 2.5rem; margin-bottom: .75rem; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.45); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.modal {
  background: #fff; border-radius: calc(var(--radio-borde) * 1.5);
  width: 100%; max-width: 500px;
  box-shadow: 0 20px 40px rgba(0,0,0,.2);
  display: flex; flex-direction: column;
  max-height: 90vh; overflow: hidden;
}
.modal__cabecera {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.375rem 1.5rem 1rem;
  border-bottom: 1px solid var(--color-borde-suave);
}
.modal__titulo    { font-size: 1.125rem; font-weight: 700; margin-bottom: .125rem; }
.modal__subtitulo { font-size: .875rem; color: var(--color-texto-suave); margin: 0; }
.modal__cerrar {
  background: none; border: none; cursor: pointer; font-size: 1.125rem;
  color: var(--color-texto-suave); padding: .25rem; border-radius: .25rem;
  transition: background .15s;
}
.modal__cerrar:hover { background: var(--color-fondo); }
.modal__cuerpo  { padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; }
.modal__pie     { padding: 1rem 1.5rem; border-top: 1px solid var(--color-borde-suave); display: flex; gap: .75rem; justify-content: flex-end; }

/* Slots */
.slots-titulo { font-size: .8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--color-texto-suave); margin-bottom: .75rem; }
.slots-grilla { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: .25rem; }
.slot-btn {
  padding: .45rem .875rem;
  border: 1.5px solid var(--color-borde-suave);
  border-radius: var(--radio-borde);
  background: #fff; font-size: .875rem; font-weight: 500;
  cursor: pointer; transition: border-color .15s, background .15s, color .15s;
  color: var(--color-texto-medio);
}
.slot-btn:hover        { border-color: var(--color-primario); color: var(--color-primario); }
.slot-btn--activo {
  background: var(--color-primario); border-color: var(--color-primario);
  color: #fff; font-weight: 600;
}
</style>
