<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Mi Disponibilidad</h1>
    </div>

    <div v-if="!profesionalId" class="estado-vacio">
      <div class="estado-vacio__icono">🔒</div>
      <p>Esta sección es solo para profesionales.</p>
    </div>

    <div v-else-if="cargando" class="cargando">Cargando configuración...</div>

    <template v-else>

      <!-- ═══ REGLAS DE HORARIO ═══ -->
      <section class="dispon-seccion">
        <div class="dispon-seccion__cabecera">
          <div>
            <h2 class="dispon-seccion__titulo">Horarios de atención</h2>
            <p class="dispon-seccion__desc">
              Definí los días y rangos horarios en que atendés. Podés agregar varias franjas por día
              para incluir pausas (por ejemplo: 09:00–13:00 y 14:00–18:00 deja el mediodía libre).
              Los buffers agregan tiempo automático entre turnos.
            </p>
          </div>
          <button class="boton-principal boton-sm" @click="abrirFormRegla()">+ Nueva franja</button>
        </div>

        <div v-if="reglas.length" class="tabla-wrapper">
          <table class="tabla">
            <thead>
              <tr>
                <th>Día</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th title="Tiempo libre antes de cada turno">Pausa antes</th>
                <th title="Tiempo libre después de cada turno">Pausa después</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="regla in reglasOrdenadas" :key="regla.id">
                <td><strong>{{ DIAS[regla.dia_semana] }}</strong></td>
                <td>{{ regla.hora_inicio }}</td>
                <td>{{ regla.hora_fin }}</td>
                <td>{{ regla.buffer_antes_minutos ?? 0 }} min</td>
                <td>{{ regla.buffer_despues_minutos ?? 0 }} min</td>
                <td class="tabla__acciones">
                  <button class="btn-icono" title="Editar" @click="abrirFormRegla(regla)">✏️</button>
                  <button class="btn-icono btn-icono--peligro" title="Eliminar" @click="eliminarRegla(regla.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="estado-vacio-inline">
          No tenés horarios configurados. Agregá una franja para empezar a recibir reservas.
        </div>
      </section>

      <!-- ═══ EXCEPCIONES / FERIADOS ═══ -->
      <section class="dispon-seccion">
        <div class="dispon-seccion__cabecera">
          <div>
            <h2 class="dispon-seccion__titulo">Feriados y excepciones</h2>
            <p class="dispon-seccion__desc">
              Bloqueá días puntuales por vacaciones, feriados o cualquier ausencia.
              También podés habilitar un día extra que normalmente no trabajás.
            </p>
          </div>
          <button class="boton-principal boton-sm" @click="abrirFormExcepcion()">+ Nueva excepción</button>
        </div>

        <div v-if="excepciones.length" class="tabla-wrapper">
          <table class="tabla">
            <thead>
              <tr><th>Fecha</th><th>Estado</th><th>Motivo</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="exc in excepciones" :key="exc.id">
                <td>{{ formatearFecha(exc.fecha) }}</td>
                <td>
                  <span :class="exc.disponible ? 'chip-verde' : 'chip-rojo'">
                    {{ exc.disponible ? 'Disponible extra' : 'Bloqueado' }}
                  </span>
                </td>
                <td>{{ exc.motivo || '—' }}</td>
                <td>
                  <button class="btn-icono btn-icono--peligro" title="Eliminar" @click="eliminarExcepcion(exc.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="estado-vacio-inline">
          No hay excepciones futuras registradas.
        </div>
      </section>

    </template>

    <!-- ═══ Modal regla / franja horaria ═══ -->
    <Teleport to="body">
      <div v-if="modalRegla.abierto" class="modal-overlay" @click.self="cerrarModalRegla">
        <div class="modal" role="dialog" aria-modal="true">

          <div class="modal__cabecera">
            <h3 class="modal__titulo">{{ modalRegla.regla ? 'Editar franja horaria' : 'Nueva franja horaria' }}</h3>
            <button class="modal__cerrar" @click="cerrarModalRegla">✕</button>
          </div>

          <div class="modal__cuerpo">
            <div class="campo">
              <label>Día de la semana</label>
              <select v-model.number="modalRegla.form.dia_semana">
                <option v-for="(nombre, idx) in DIAS" :key="idx" :value="idx">{{ nombre }}</option>
              </select>
            </div>
            <div class="dispon-fila-2">
              <div class="campo">
                <label>Hora inicio</label>
                <input type="time" v-model="modalRegla.form.hora_inicio" />
              </div>
              <div class="campo">
                <label>Hora fin</label>
                <input type="time" v-model="modalRegla.form.hora_fin" />
              </div>
            </div>
            <p class="campo-ayuda" style="margin-top:-.5rem;margin-bottom:1rem">
              💡 Para agregar una pausa al mediodía, creá dos franjas: mañana y tarde.
            </p>
            <div class="dispon-fila-2">
              <div class="campo">
                <label>Pausa antes de cada turno (min)</label>
                <input type="number" min="0" step="5" v-model.number="modalRegla.form.buffer_antes_minutos" />
                <small class="campo-ayuda">Tiempo libre antes de que empiece el turno.</small>
              </div>
              <div class="campo">
                <label>Pausa después de cada turno (min)</label>
                <input type="number" min="0" step="5" v-model.number="modalRegla.form.buffer_despues_minutos" />
                <small class="campo-ayuda">Tiempo libre al terminar el turno (preparación, traslado, etc.).</small>
              </div>
            </div>
            <p v-if="modalRegla.error" class="alerta alerta--error">{{ modalRegla.error }}</p>
          </div>

          <div class="modal__pie">
            <button class="boton-secundario" @click="cerrarModalRegla">Cancelar</button>
            <button class="boton-principal" :disabled="modalRegla.enviando" @click="guardarRegla">
              {{ modalRegla.enviando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══ Modal excepción / feriado ═══ -->
    <Teleport to="body">
      <div v-if="modalExc.abierto" class="modal-overlay" @click.self="cerrarModalExc">
        <div class="modal" role="dialog" aria-modal="true">

          <div class="modal__cabecera">
            <h3 class="modal__titulo">Nueva excepción</h3>
            <button class="modal__cerrar" @click="cerrarModalExc">✕</button>
          </div>

          <div class="modal__cuerpo">
            <div class="campo">
              <label>Fecha</label>
              <input type="date" v-model="modalExc.form.fecha" :min="hoy" />
            </div>
            <div class="campo">
              <label>Tipo de excepción</label>
              <select v-model="modalExc.form.disponible">
                <option :value="false">🔴 Día bloqueado (feriado, vacaciones, ausencia)</option>
                <option :value="true">🟢 Día habilitado extra (trabajo fuera de mi horario habitual)</option>
              </select>
            </div>
            <div class="campo">
              <label>Motivo <span style="font-weight:400">(opcional)</span></label>
              <input type="text" v-model="modalExc.form.motivo" placeholder="Ej: Feriado nacional, vacaciones, capacitación..." />
            </div>
            <p v-if="modalExc.error" class="alerta alerta--error">{{ modalExc.error }}</p>
          </div>

          <div class="modal__pie">
            <button class="boton-secundario" @click="cerrarModalExc">Cancelar</button>
            <button class="boton-principal" :disabled="modalExc.enviando" @click="guardarExcepcion">
              {{ modalExc.enviando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useConfirm } from '@/composables/useConfirm.js'
import axios from 'axios'

const { confirmar } = useConfirm()

const auth        = useAuthStore()
const cargando    = ref(true)
const reglas      = ref([])
const excepciones = ref([])
const hoy         = new Date().toISOString().slice(0, 10)

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const profesionalId = auth.usuario?.profesional?.id

const reglasOrdenadas = computed(() =>
  [...reglas.value].sort((a, b) => a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio))
)

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const [y, m, d] = (typeof fecha === 'string' ? fecha : fecha.substring(0, 10)).split('-')
  return `${d}/${m}/${y}`
}

// ── Estado modales ────────────────────────────────────────────────────────────
const modalRegla = ref({ abierto: false, regla: null, enviando: false, error: '', form: reglaPorDefecto() })
const modalExc   = ref({ abierto: false, enviando: false, error: '', form: excepcionPorDefecto() })

function reglaPorDefecto() {
  return { dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00', buffer_antes_minutos: 0, buffer_despues_minutos: 0 }
}
function excepcionPorDefecto() {
  return { fecha: '', disponible: false, motivo: '' }
}

// ── Carga inicial ─────────────────────────────────────────────────────────────
async function cargarDatos() {
  if (!profesionalId) { cargando.value = false; return }
  try {
    const [rReglas, rExc] = await Promise.all([
      axios.get(`/api/profesionales/${profesionalId}/disponibilidad/reglas`),
      axios.get(`/api/profesionales/${profesionalId}/disponibilidad/excepciones`),
    ])
    reglas.value     = rReglas.data
    excepciones.value = rExc.data
  } finally {
    cargando.value = false
  }
}

// ── Reglas ────────────────────────────────────────────────────────────────────
function abrirFormRegla(regla = null) {
  modalRegla.value = {
    abierto: true, regla, enviando: false, error: '',
    form: regla
      ? { dia_semana: regla.dia_semana, hora_inicio: regla.hora_inicio, hora_fin: regla.hora_fin,
          buffer_antes_minutos: regla.buffer_antes_minutos ?? 0, buffer_despues_minutos: regla.buffer_despues_minutos ?? 0 }
      : reglaPorDefecto(),
  }
}
function cerrarModalRegla() { modalRegla.value.abierto = false }

async function guardarRegla() {
  modalRegla.value.error    = ''
  modalRegla.value.enviando = true
  try {
    if (modalRegla.value.regla) {
      const { data } = await axios.put(
        `/api/profesionales/${profesionalId}/disponibilidad/reglas/${modalRegla.value.regla.id}`,
        modalRegla.value.form
      )
      const idx = reglas.value.findIndex(r => r.id === data.id)
      if (idx !== -1) reglas.value[idx] = data
    } else {
      const { data } = await axios.post(
        `/api/profesionales/${profesionalId}/disponibilidad/reglas`,
        modalRegla.value.form
      )
      reglas.value.push(data)
    }
    cerrarModalRegla()
  } catch (e) {
    modalRegla.value.error = e.response?.data?.message || 'Error al guardar la franja.'
  } finally {
    modalRegla.value.enviando = false
  }
}

async function eliminarRegla(id) {
  if (!await confirmar('¿Eliminar esta franja horaria?')) return
  await axios.delete(`/api/profesionales/${profesionalId}/disponibilidad/reglas/${id}`)
  reglas.value = reglas.value.filter(r => r.id !== id)
}

// ── Excepciones ───────────────────────────────────────────────────────────────
function abrirFormExcepcion() {
  modalExc.value = { abierto: true, enviando: false, error: '', form: excepcionPorDefecto() }
}
function cerrarModalExc() { modalExc.value.abierto = false }

async function guardarExcepcion() {
  modalExc.value.error    = ''
  modalExc.value.enviando = true
  try {
    const { data } = await axios.post(
      `/api/profesionales/${profesionalId}/disponibilidad/excepciones`,
      modalExc.value.form
    )
    const idx = excepciones.value.findIndex(e => e.id === data.id)
    if (idx !== -1) excepciones.value[idx] = data
    else excepciones.value.push(data)
    excepciones.value.sort((a, b) => {
      const fa = typeof a.fecha === 'string' ? a.fecha : a.fecha.substring(0, 10)
      const fb = typeof b.fecha === 'string' ? b.fecha : b.fecha.substring(0, 10)
      return fa.localeCompare(fb)
    })
    cerrarModalExc()
  } catch (e) {
    modalExc.value.error = e.response?.data?.message || 'Error al guardar la excepción.'
  } finally {
    modalExc.value.enviando = false
  }
}

async function eliminarExcepcion(id) {
  if (!await confirmar('¿Eliminar esta excepción?')) return
  await axios.delete(`/api/profesionales/${profesionalId}/disponibilidad/excepciones/${id}`)
  excepciones.value = excepciones.value.filter(e => e.id !== id)
}

onMounted(cargarDatos)
</script>
