<template>
  <div>
    <div class="layout-panel__encabezado" style="display:flex;align-items:center;justify-content:space-between">
      <h1 class="layout-panel__titulo-pagina">Mis Servicios</h1>
      <button class="boton-principal" @click="mostrarFormServicio = !mostrarFormServicio">
        {{ mostrarFormServicio ? '✕ Cancelar' : '+ Nuevo servicio' }}
      </button>
    </div>

    <!-- Formulario nuevo servicio -->
    <div v-if="mostrarFormServicio" class="tarjeta form-nuevo-servicio">
      <h3 style="margin-bottom:1.25rem">Agregar servicio</h3>
      <p v-if="errorForm" class="alerta alerta--error">{{ errorForm }}</p>
      <form @submit.prevent="crearServicio">
        <div class="campo-fila">
          <div class="campo">
            <label>Nombre del servicio</label>
            <input v-model="nuevoServicio.nombre" placeholder="Ej: Sesión de coaching" required />
          </div>
          <div class="campo">
            <label>Modalidad</label>
            <select v-model="nuevoServicio.modalidad" required>
              <option value="presencial">Presencial</option>
              <option value="remota">Remota</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </div>
        </div>
        <div class="campo">
          <label>Descripción</label>
          <textarea v-model="nuevoServicio.descripcion" placeholder="Describí brevemente el servicio..." rows="2"></textarea>
        </div>
        <div class="campo-fila">
          <div class="campo">
            <label>Precio ($)</label>
            <input v-model.number="nuevoServicio.precio" type="number" min="0" step="0.01" placeholder="0.00" required />
          </div>
          <div class="campo">
            <label>Duración (minutos)</label>
            <input v-model.number="nuevoServicio.duracion_minutos" type="number" min="15" step="15" placeholder="60" required />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:.75rem">
          <button type="button" class="boton-secundario" @click="mostrarFormServicio = false">Cancelar</button>
          <button type="submit" class="boton-principal" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar servicio' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de servicios -->
    <div v-if="cargando" class="cargando">Cargando servicios...</div>

    <div v-else-if="servicios.length" class="servicios-lista">
      <div v-for="servicio in servicios" :key="servicio.id" class="servicio-bloque">

        <!-- Cabecera del servicio -->
        <div class="servicio-bloque__cabecera" @click="togglePaquetes(servicio)">
          <div class="servicio-bloque__info">
            <p class="servicio-bloque__nombre">{{ servicio.nombre }}</p>
            <p class="servicio-bloque__meta">
              ${{ servicio.precio }} · ⏱ {{ servicio.duracion_minutos }} min · {{ servicio.modalidad }}
            </p>
          </div>
          <div class="servicio-bloque__acciones">
            <span :class="['insignia', servicio.activo ? 'insignia--confirmada' : 'insignia--cancelada']">
              {{ servicio.activo ? 'Activo' : 'Inactivo' }}
            </span>
            <span class="servicio-bloque__chevron" :class="{ 'servicio-bloque__chevron--abierto': expandidos.has(servicio.id) }">
              ▾
            </span>
          </div>
        </div>

        <!-- Sección de paquetes (expandible) -->
        <div v-if="expandidos.has(servicio.id)" class="paquetes-seccion">
          <div class="paquetes-seccion__cabecera">
            <p class="paquetes-seccion__titulo">Paquetes de sesiones</p>
            <button class="boton-principal boton-sm" @click.stop="abrirModalPaquete(servicio)">
              + Nuevo paquete
            </button>
          </div>
          <p class="paquetes-seccion__ayuda">
            Ofrecé descuentos por volumen. Los clientes compran el paquete y agotan las sesiones progresivamente.
          </p>

          <div v-if="cargandoPaquetes.has(servicio.id)" class="cargando" style="padding:1rem">
            Cargando paquetes...
          </div>
          <template v-else>
            <div v-if="paquetesPorServicio[servicio.id]?.length" class="paquetes-tabla">
              <table class="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Sesiones</th>
                    <th>Precio total</th>
                    <th>Precio/sesión</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="paquete in paquetesPorServicio[servicio.id]" :key="paquete.id">
                    <td>
                      <strong>{{ paquete.nombre }}</strong>
                      <p v-if="paquete.descripcion" class="td-suave" style="font-size:.8rem;margin-top:.1rem">{{ paquete.descripcion }}</p>
                    </td>
                    <td>{{ paquete.cantidad_sesiones }}</td>
                    <td>${{ paquete.precio }}</td>
                    <td class="td-suave">${{ (paquete.precio / paquete.cantidad_sesiones).toFixed(2) }}</td>
                    <td>
                      <span :class="['insignia', paquete.activo ? 'insignia--confirmada' : 'insignia--cancelada']">
                        {{ paquete.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex;gap:.375rem">
                        <button class="boton-secundario boton-xs" @click="abrirModalEditarPaquete(servicio, paquete)">
                          ✏️ Editar
                        </button>
                        <button
                          v-if="paquete.activo"
                          class="boton-peligro boton-xs"
                          @click="desactivarPaquete(servicio, paquete)">
                          Desactivar
                        </button>
                        <button
                          v-else
                          class="boton-secundario boton-xs"
                          @click="activarPaquete(servicio, paquete)">
                          Activar
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="paquetes-vacio">
              No hay paquetes para este servicio.
              <button class="boton-secundario boton-sm" style="margin-left:.75rem" @click.stop="abrirModalPaquete(servicio)">
                + Crear primero
              </button>
            </div>
          </template>
        </div>

      </div>
    </div>

    <div v-else-if="!mostrarFormServicio" class="estado-vacio">
      <div class="estado-vacio__icono">💼</div>
      <h3>Sin servicios</h3>
      <p>Todavía no publicaste ningún servicio.</p>
      <button class="boton-principal" style="margin-top:1rem" @click="mostrarFormServicio = true">
        + Crear primer servicio
      </button>
    </div>

    <!-- ══ Modal crear / editar paquete ══ -->
    <Teleport to="body">
      <div v-if="modalPaquete.abierto" class="modal-overlay" @click.self="modalPaquete.abierto = false">
        <div class="modal">
          <div class="modal__cabecera">
            <div>
              <h3 class="modal__titulo">{{ modalPaquete.editando ? 'Editar paquete' : 'Nuevo paquete' }}</h3>
              <p class="modal__subtitulo">{{ modalPaquete.servicio?.nombre }}</p>
            </div>
            <button class="modal__cerrar" @click="modalPaquete.abierto = false">✕</button>
          </div>
          <div class="modal__cuerpo">
            <div class="campo">
              <label>Nombre del paquete</label>
              <input v-model="modalPaquete.form.nombre" placeholder="Ej: Pack 6 sesiones — ahorrá 20%" required />
            </div>
            <div class="campo">
              <label>Descripción <span style="font-weight:400">(opcional)</span></label>
              <textarea v-model="modalPaquete.form.descripcion" rows="2"
                placeholder="Ej: Ideal para tratamientos continuos. Sesiones sin vencimiento."></textarea>
            </div>
            <div class="campo-fila">
              <div class="campo">
                <label>Cantidad de sesiones</label>
                <input v-model.number="modalPaquete.form.cantidad_sesiones" type="number" min="2" max="100" />
                <small class="campo-ayuda">Mínimo 2 sesiones por paquete.</small>
              </div>
              <div class="campo">
                <label>Precio total ($)</label>
                <input v-model.number="modalPaquete.form.precio" type="number" min="0" step="0.01" />
                <small v-if="modalPaquete.form.cantidad_sesiones > 0 && modalPaquete.form.precio > 0" class="campo-ayuda">
                  = ${{ (modalPaquete.form.precio / modalPaquete.form.cantidad_sesiones).toFixed(2) }} por sesión
                </small>
              </div>
            </div>
            <p v-if="modalPaquete.error" class="alerta alerta--error">{{ modalPaquete.error }}</p>
          </div>
          <div class="modal__pie">
            <button class="boton-secundario" @click="modalPaquete.abierto = false">Cancelar</button>
            <button class="boton-principal" :disabled="modalPaquete.enviando" @click="guardarPaquete">
              {{ modalPaquete.enviando ? 'Guardando...' : 'Guardar paquete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const profesionalId = auth.usuario?.profesional?.id

const servicios          = ref([])
const mostrarFormServicio = ref(false)
const cargando           = ref(false)
const guardando          = ref(false)
const errorForm          = ref('')

// Paquetes por servicio
const expandidos        = reactive(new Set())
const paquetesPorServicio = reactive({})
const cargandoPaquetes  = reactive(new Set())

const nuevoServicio = ref({
  nombre: '', descripcion: '', precio: '', duracion_minutos: 60, modalidad: 'presencial',
})

const modalPaquete = ref({
  abierto: false, editando: false, servicio: null, paquete: null,
  enviando: false, error: '',
  form: { nombre: '', descripcion: '', cantidad_sesiones: 4, precio: '' },
})

// ── Servicios ─────────────────────────────────────────────────────────────────
async function cargarServicios() {
  if (!profesionalId) return
  cargando.value = true
  try {
    const { data } = await axios.get(`/api/profesionales/${profesionalId}/servicios`)
    servicios.value = data
  } finally {
    cargando.value = false
  }
}

async function crearServicio() {
  errorForm.value = ''
  guardando.value = true
  try {
    const { data } = await axios.post(`/api/profesionales/${profesionalId}/servicios`, nuevoServicio.value)
    servicios.value.unshift(data)
    mostrarFormServicio.value = false
    nuevoServicio.value = { nombre: '', descripcion: '', precio: '', duracion_minutos: 60, modalidad: 'presencial' }
  } catch (e) {
    errorForm.value = e.response?.data?.error || 'Error al guardar el servicio.'
  } finally {
    guardando.value = false
  }
}

// ── Paquetes ──────────────────────────────────────────────────────────────────
async function togglePaquetes(servicio) {
  if (expandidos.has(servicio.id)) {
    expandidos.delete(servicio.id)
    return
  }
  expandidos.add(servicio.id)
  await cargarPaquetes(servicio)
}

async function cargarPaquetes(servicio) {
  if (paquetesPorServicio[servicio.id]) return  // ya cargados
  cargandoPaquetes.add(servicio.id)
  try {
    const { data } = await axios.get(
      `/api/profesionales/${profesionalId}/servicios/${servicio.id}/paquetes`
    )
    paquetesPorServicio[servicio.id] = data
  } finally {
    cargandoPaquetes.delete(servicio.id)
  }
}

function abrirModalPaquete(servicio) {
  modalPaquete.value = {
    abierto: true, editando: false, servicio, paquete: null,
    enviando: false, error: '',
    form: { nombre: '', descripcion: '', cantidad_sesiones: 4, precio: '' },
  }
}

function abrirModalEditarPaquete(servicio, paquete) {
  modalPaquete.value = {
    abierto: true, editando: true, servicio, paquete,
    enviando: false, error: '',
    form: {
      nombre: paquete.nombre,
      descripcion: paquete.descripcion || '',
      cantidad_sesiones: paquete.cantidad_sesiones,
      precio: paquete.precio,
    },
  }
}

async function guardarPaquete() {
  modalPaquete.value.error    = ''
  modalPaquete.value.enviando = true
  const { servicio, paquete, editando, form } = modalPaquete.value

  try {
    if (editando) {
      const { data } = await axios.put(
        `/api/profesionales/${profesionalId}/servicios/${servicio.id}/paquetes/${paquete.id}`,
        form
      )
      const idx = paquetesPorServicio[servicio.id]?.findIndex(p => p.id === data.id)
      if (idx !== undefined && idx !== -1) paquetesPorServicio[servicio.id][idx] = data
    } else {
      const { data } = await axios.post(
        `/api/profesionales/${profesionalId}/servicios/${servicio.id}/paquetes`,
        form
      )
      if (!paquetesPorServicio[servicio.id]) paquetesPorServicio[servicio.id] = []
      paquetesPorServicio[servicio.id].push(data)
    }
    modalPaquete.value.abierto = false
  } catch (e) {
    modalPaquete.value.error = e.response?.data?.message || 'Error al guardar el paquete.'
  } finally {
    modalPaquete.value.enviando = false
  }
}

async function desactivarPaquete(servicio, paquete) {
  if (!confirm(`¿Desactivar el paquete "${paquete.nombre}"? Los clientes que ya lo compraron no se ven afectados.`)) return
  await axios.put(
    `/api/profesionales/${profesionalId}/servicios/${servicio.id}/paquetes/${paquete.id}`,
    { activo: false }
  )
  paquete.activo = false
}

async function activarPaquete(servicio, paquete) {
  await axios.put(
    `/api/profesionales/${profesionalId}/servicios/${servicio.id}/paquetes/${paquete.id}`,
    { activo: true }
  )
  paquete.activo = true
}

onMounted(cargarServicios)
</script>

<style scoped>
.form-nuevo-servicio { margin-bottom: 1.5rem; }

/* Lista de servicios */
.servicios-lista { display: flex; flex-direction: column; gap: 1rem; }

.servicio-bloque {
  background: #fff;
  border: 1px solid var(--color-borde-suave);
  border-radius: calc(var(--radio-borde) * 1.5);
  overflow: hidden;
  box-shadow: var(--sombra);
}

.servicio-bloque__cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background .15s;
  user-select: none;
}
.servicio-bloque__cabecera:hover { background: var(--color-fondo); }

.servicio-bloque__info { flex: 1; min-width: 0; }
.servicio-bloque__nombre { font-size: 1rem; font-weight: 700; margin-bottom: .2rem; }
.servicio-bloque__meta { font-size: .8125rem; color: var(--color-texto-suave); text-transform: capitalize; }

.servicio-bloque__acciones { display: flex; align-items: center; gap: .75rem; flex-shrink: 0; margin-left: 1rem; }
.servicio-bloque__chevron { font-size: .9rem; color: var(--color-texto-suave); transition: transform .2s; }
.servicio-bloque__chevron--abierto { transform: rotate(180deg); }

/* Sección paquetes */
.paquetes-seccion {
  border-top: 1px solid var(--color-borde-suave);
  padding: 1.125rem 1.25rem;
  background: var(--color-fondo);
}
.paquetes-seccion__cabecera {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: .375rem;
}
.paquetes-seccion__titulo { font-size: .8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--color-texto-suave); }
.paquetes-seccion__ayuda { font-size: .8125rem; color: var(--color-texto-suave); margin-bottom: 1rem; line-height: 1.4; }

.paquetes-tabla { overflow-x: auto; border-radius: var(--radio-borde); border: 1px solid var(--color-borde-suave); background: #fff; }
.paquetes-vacio { font-size: .875rem; color: var(--color-texto-suave); padding: .75rem 0; display: flex; align-items: center; }

.td-suave { color: var(--color-texto-suave); }
.boton-sm  { padding: .35rem .75rem; font-size: .8125rem; }
.boton-xs  { padding: .25rem .6rem; font-size: .8125rem; }
.campo-ayuda { font-size: .75rem; color: var(--color-texto-suave); margin-top: .2rem; display: block; }

/* Estado vacío */
.estado-vacio { text-align: center; padding: 4rem 1rem; color: var(--color-texto-suave); }
.estado-vacio__icono { font-size: 3rem; margin-bottom: 1rem; }
.estado-vacio h3 { font-size: 1.25rem; color: var(--color-texto-medio); margin-bottom: .5rem; }
</style>
