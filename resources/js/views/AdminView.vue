<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Panel Administrativo</h1>
    </div>

    <!-- Tabs principales -->
    <div class="admin-tabs">
      <button v-for="tab in TABS" :key="tab.id"
        :class="['admin-tab', tabActivo === tab.id && 'admin-tab--activo']"
        @click="tabActivo = tab.id">
        {{ tab.label }}
      </button>
    </div>

    <div v-if="cargando" class="cargando" style="padding:3rem">Cargando...</div>

    <template v-else>

      <!-- ══════════ TAB: DASHBOARD ══════════ -->
      <div v-show="tabActivo === 'dashboard'">

        <p class="admin-seccion-titulo">Actividad reciente</p>
        <div class="estadisticas" style="margin-bottom:2rem">
          <div class="estadistica-tarjeta estadistica-tarjeta--acento">
            <div class="estadistica-tarjeta__valor">{{ stats.recientes?.reservas_hoy ?? 0 }}</div>
            <div class="estadistica-tarjeta__etiqueta">Reservas hoy</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--acento">
            <div class="estadistica-tarjeta__valor">{{ stats.recientes?.usuarios_semana ?? 0 }}</div>
            <div class="estadistica-tarjeta__etiqueta">Usuarios esta semana</div>
          </div>
        </div>

        <p class="admin-seccion-titulo">Usuarios</p>
        <div class="estadisticas">
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ stats.usuarios?.total }}</div>
            <div class="estadistica-tarjeta__etiqueta">Total de usuarios</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ stats.usuarios?.clientes }}</div>
            <div class="estadistica-tarjeta__etiqueta">Clientes</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ stats.usuarios?.profesionales }}</div>
            <div class="estadistica-tarjeta__etiqueta">Profesionales</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--rojo">
            <div class="estadistica-tarjeta__valor">{{ stats.usuarios?.inactivos }}</div>
            <div class="estadistica-tarjeta__etiqueta">Cuentas inactivas</div>
          </div>
        </div>

        <p class="admin-seccion-titulo">Reservas</p>
        <div class="estadisticas">
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ stats.reservas?.total }}</div>
            <div class="estadistica-tarjeta__etiqueta">Total reservas</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--amarillo">
            <div class="estadistica-tarjeta__valor">{{ stats.reservas?.pendientes }}</div>
            <div class="estadistica-tarjeta__etiqueta">Pendientes</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ stats.reservas?.confirmadas }}</div>
            <div class="estadistica-tarjeta__etiqueta">Confirmadas</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--verde">
            <div class="estadistica-tarjeta__valor">{{ stats.reservas?.finalizadas }}</div>
            <div class="estadistica-tarjeta__etiqueta">Finalizadas</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--rojo">
            <div class="estadistica-tarjeta__valor">{{ stats.reservas?.canceladas }}</div>
            <div class="estadistica-tarjeta__etiqueta">Canceladas</div>
          </div>
        </div>

        <p class="admin-seccion-titulo">Métricas de rendimiento</p>
        <div class="estadisticas">
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ stats.reservas?.tasa_finalizacion }}%</div>
            <div class="estadistica-tarjeta__etiqueta">Tasa de finalización</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--rojo">
            <div class="estadistica-tarjeta__valor">{{ stats.reservas?.tasa_cancelacion }}%</div>
            <div class="estadistica-tarjeta__etiqueta">Tasa de cancelación</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--verde">
            <div class="estadistica-tarjeta__valor">{{ stats.profesionales?.activos }}</div>
            <div class="estadistica-tarjeta__etiqueta">Profesionales activos</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--gris">
            <div class="estadistica-tarjeta__valor">{{ stats.profesionales?.inactivos }}</div>
            <div class="estadistica-tarjeta__etiqueta">Profesionales inactivos</div>
          </div>
        </div>
      </div>

      <!-- ══════════ TAB: USUARIOS ══════════ -->
      <div v-show="tabActivo === 'usuarios'">
        <div class="admin-bloque">
          <div class="admin-bloque__cabecera">
            <p class="admin-seccion-titulo" style="margin-bottom:0">Gestión de usuarios</p>
            <div class="admin-filtros">
              <input v-model="filtrosU.busqueda" type="search" placeholder="Buscar nombre o email..."
                class="admin-input" @input="debounceBuscar" />
              <select v-model="filtrosU.rol" class="admin-select" @change="cargarUsuarios(1)">
                <option value="">Todos los roles</option>
                <option value="cliente">Clientes</option>
                <option value="profesional">Profesionales</option>
                <option value="admin">Admins</option>
              </select>
              <select v-model="filtrosU.activo" class="admin-select" @change="cargarUsuarios(1)">
                <option value="">Todos los estados</option>
                <option value="1">Activos</option>
                <option value="0">Inactivos</option>
              </select>
            </div>
          </div>

          <div v-if="cargandoUsuarios" class="cargando" style="padding:2rem">Cargando usuarios...</div>
          <template v-else>
            <div class="tabla-wrapper">
              <table class="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th><th>Email</th><th>Teléfono</th>
                    <th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in usuarios.data" :key="u.id">
                    <td><strong>{{ u.name }}</strong></td>
                    <td class="td-suave">{{ u.email }}</td>
                    <td class="td-suave">{{ u.telefono || '—' }}</td>
                    <td><span :class="['chip-rol', 'chip-rol--' + u.rol]">{{ u.rol }}</span></td>
                    <td><span :class="u.activo ? 'chip-verde' : 'chip-rojo'">{{ u.activo ? 'Activo' : 'Inactivo' }}</span></td>
                    <td class="td-suave td-nowrap">{{ formatFecha(u.created_at) }}</td>
                    <td>
                      <div class="acciones-fila">
                        <button class="boton-secundario boton-xs" @click="abrirEditarUsuario(u)">✏️ Editar</button>
                        <button
                          :class="u.activo ? 'boton-peligro boton-xs' : 'boton-principal boton-xs'"
                          :disabled="toggleando === u.id"
                          @click="toggleActivar(u)">
                          {{ toggleando === u.id ? '...' : (u.activo ? 'Desactivar' : 'Activar') }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="usuarios.last_page > 1" class="paginacion">
              <button v-for="p in usuarios.last_page" :key="p"
                :class="['paginacion__btn', p === usuarios.current_page && 'paginacion__btn--activo']"
                @click="cargarUsuarios(p)">{{ p }}</button>
            </div>
          </template>
        </div>
      </div>

      <!-- ══════════ TAB: RESERVAS ══════════ -->
      <div v-show="tabActivo === 'reservas'">
        <div class="admin-bloque">
          <div class="admin-bloque__cabecera">
            <p class="admin-seccion-titulo" style="margin-bottom:0">Supervisión de reservas</p>
            <div class="admin-filtros">
              <input v-model="filtrosR.busqueda" type="search" placeholder="Buscar cliente, profesional o servicio..."
                class="admin-input" @input="debounceReservas" />
              <select v-model="filtrosR.estado" class="admin-select" @change="cargarReservas(1)">
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <input v-model="filtrosR.desde" type="date" class="admin-input admin-input--fecha" @change="cargarReservas(1)" title="Desde" />
              <input v-model="filtrosR.hasta" type="date" class="admin-input admin-input--fecha" @change="cargarReservas(1)" title="Hasta" />
            </div>
          </div>

          <div v-if="cargandoReservas" class="cargando" style="padding:2rem">Cargando reservas...</div>
          <template v-else>
            <div class="tabla-wrapper">
              <table class="tabla">
                <thead>
                  <tr>
                    <th>Servicio</th><th>Cliente</th><th>Profesional</th>
                    <th>Fecha</th><th>Modalidad</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in reservas.data" :key="r.id">
                    <td><strong>{{ r.servicio?.nombre }}</strong></td>
                    <td>{{ r.cliente?.name || '—' }}</td>
                    <td>{{ r.profesional?.name || '—' }}</td>
                    <td class="td-nowrap td-suave">{{ formatFechaHora(r.fecha_hora) }}</td>
                    <td style="text-transform:capitalize">{{ r.modalidad }}</td>
                    <td><span :class="['insignia', insigniaEstado(r.estado)]">{{ etiquetaEstado(r.estado) }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="reservas.last_page > 1" class="paginacion">
              <button v-for="p in reservas.last_page" :key="p"
                :class="['paginacion__btn', p === reservas.current_page && 'paginacion__btn--activo']"
                @click="cargarReservas(p)">{{ p }}</button>
            </div>
          </template>
        </div>
      </div>

    </template>

    <!-- ══ Modal editar usuario ══ -->
    <Teleport to="body">
      <div v-if="modalEditar.abierto" class="modal-overlay" @click.self="modalEditar.abierto = false">
        <div class="modal">
          <div class="modal__cabecera">
            <div>
              <h3 class="modal__titulo">Editar usuario</h3>
              <p class="modal__subtitulo">{{ modalEditar.usuario?.email }}</p>
            </div>
            <button class="modal__cerrar" @click="modalEditar.abierto = false">✕</button>
          </div>
          <div class="modal__cuerpo">
            <div class="campo">
              <label>Nombre completo</label>
              <input v-model="modalEditar.form.name" type="text" />
            </div>
            <div class="campo">
              <label>Email</label>
              <input v-model="modalEditar.form.email" type="email" />
            </div>
            <div class="campo">
              <label>Teléfono</label>
              <input v-model="modalEditar.form.telefono" type="text" placeholder="+598 99 ..." />
            </div>
            <div class="campo-fila">
              <div class="campo">
                <label>Rol</label>
                <select v-model="modalEditar.form.rol">
                  <option value="cliente">Cliente</option>
                  <option value="profesional">Profesional</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="campo">
                <label>Estado de cuenta</label>
                <select v-model="modalEditar.form.activo">
                  <option :value="true">Activa</option>
                  <option :value="false">Inactiva</option>
                </select>
              </div>
            </div>
            <p v-if="modalEditar.error" class="alerta alerta--error">{{ modalEditar.error }}</p>
            <p v-if="modalEditar.exito" class="alerta alerta--exito">{{ modalEditar.exito }}</p>
          </div>
          <div class="modal__pie">
            <button class="boton-secundario" @click="modalEditar.abierto = false">Cancelar</button>
            <button class="boton-principal" :disabled="modalEditar.enviando" @click="guardarUsuario">
              {{ modalEditar.enviando ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'usuarios',  label: '👥 Usuarios' },
  { id: 'reservas',  label: '📅 Reservas' },
]

const tabActivo       = ref('dashboard')
const cargando        = ref(true)
const cargandoUsuarios = ref(false)
const cargandoReservas = ref(false)
const toggleando      = ref(null)
const stats           = ref({})

const usuarios  = ref({ data: [], current_page: 1, last_page: 1 })
const reservas  = ref({ data: [], current_page: 1, last_page: 1 })
const filtrosU  = ref({ busqueda: '', rol: '', activo: '' })
const filtrosR  = ref({ busqueda: '', estado: '', desde: '', hasta: '' })

let timerU = null, timerR = null

const ETIQUETAS = { pendiente: 'Pendiente', confirmada: 'Confirmada', pagada: 'Pagada', en_curso: 'En curso', finalizada: 'Finalizada', cancelada: 'Cancelada' }
const INSIGNIAS = { pendiente: 'insignia--pendiente', confirmada: 'insignia--confirmada', pagada: 'insignia--pagada', en_curso: 'insignia--en-curso', finalizada: 'insignia--finalizada', cancelada: 'insignia--cancelada' }
function etiquetaEstado(e) { return ETIQUETAS[e] || e }
function insigniaEstado(e)  { return INSIGNIAS[e] || '' }

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatFechaHora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' })
}

// ── Estadísticas ──────────────────────────────────────────────────────────────
async function cargarStats() {
  try {
    const { data } = await axios.get('/api/admin/estadisticas')
    stats.value = data
  } catch { /* sin permisos */ }
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
function debounceBuscar() {
  clearTimeout(timerU)
  timerU = setTimeout(() => cargarUsuarios(1), 400)
}

async function cargarUsuarios(pagina = 1) {
  cargandoUsuarios.value = true
  try {
    const params = { page: pagina }
    if (filtrosU.value.rol)      params.rol      = filtrosU.value.rol
    if (filtrosU.value.busqueda) params.busqueda  = filtrosU.value.busqueda
    if (filtrosU.value.activo !== '') params.activo = filtrosU.value.activo
    const { data } = await axios.get('/api/admin/usuarios', { params })
    usuarios.value = data
  } finally {
    cargandoUsuarios.value = false
  }
}

async function toggleActivar(u) {
  toggleando.value = u.id
  try {
    const { data } = await axios.patch(`/api/admin/usuarios/${u.id}/activar`)
    u.activo = data.usuario.activo
  } catch (e) {
    alert(e.response?.data?.error || 'Error al cambiar estado.')
  } finally {
    toggleando.value = null
  }
}

// ── Editar usuario ────────────────────────────────────────────────────────────
const modalEditar = ref({ abierto: false, usuario: null, enviando: false, error: '', exito: '', form: {} })

function abrirEditarUsuario(u) {
  modalEditar.value = {
    abierto: true, usuario: u, enviando: false, error: '', exito: '',
    form: { name: u.name, email: u.email, telefono: u.telefono || '', rol: u.rol, activo: u.activo },
  }
}

async function guardarUsuario() {
  modalEditar.value.error  = ''
  modalEditar.value.exito  = ''
  modalEditar.value.enviando = true
  try {
    const { data } = await axios.put(`/api/admin/usuarios/${modalEditar.value.usuario.id}`, modalEditar.value.form)
    // Actualizar en la lista local
    const idx = usuarios.value.data.findIndex(u => u.id === data.usuario.id)
    if (idx !== -1) Object.assign(usuarios.value.data[idx], data.usuario)
    modalEditar.value.exito = data.mensaje
    setTimeout(() => { modalEditar.value.abierto = false }, 1200)
  } catch (e) {
    modalEditar.value.error = e.response?.data?.message || e.response?.data?.error || 'Error al guardar.'
  } finally {
    modalEditar.value.enviando = false
  }
}

// ── Reservas ──────────────────────────────────────────────────────────────────
function debounceReservas() {
  clearTimeout(timerR)
  timerR = setTimeout(() => cargarReservas(1), 400)
}

async function cargarReservas(pagina = 1) {
  cargandoReservas.value = true
  try {
    const params = { page: pagina }
    if (filtrosR.value.estado)   params.estado   = filtrosR.value.estado
    if (filtrosR.value.busqueda) params.busqueda  = filtrosR.value.busqueda
    if (filtrosR.value.desde)    params.desde     = filtrosR.value.desde
    if (filtrosR.value.hasta)    params.hasta     = filtrosR.value.hasta
    const { data } = await axios.get('/api/admin/reservas', { params })
    reservas.value = data
  } finally {
    cargandoReservas.value = false
  }
}

onMounted(async () => {
  await Promise.all([cargarStats(), cargarUsuarios(), cargarReservas()])
  cargando.value = false
})
</script>

<style scoped>
/* Tabs */
.admin-tabs { display: flex; gap: .375rem; margin-bottom: 1.75rem; border-bottom: 2px solid var(--color-borde-suave); }
.admin-tab  { padding: .625rem 1.25rem; font-size: .9375rem; font-weight: 500; border: none; background: none; cursor: pointer; color: var(--color-texto-suave); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color .15s, border-color .15s; }
.admin-tab:hover { color: var(--color-primario); }
.admin-tab--activo { color: var(--color-primario); border-bottom-color: var(--color-primario); font-weight: 600; }

/* Estadística cards variantes */
.admin-seccion-titulo { font-size: .875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--color-texto-suave); margin-bottom: .875rem; }
.admin-seccion-titulo + .estadisticas { margin-bottom: 2rem; }
.estadistica-tarjeta--acento  { border-top-color: var(--color-acento); }
.estadistica-tarjeta--amarillo{ border-top-color: #f59e0b; }
.estadistica-tarjeta--verde   { border-top-color: #22c55e; }
.estadistica-tarjeta--rojo    { border-top-color: #ef4444; }
.estadistica-tarjeta--gris    { border-top-color: var(--color-borde-suave); }

/* Bloque con filtros */
.admin-bloque { background: #fff; border: 1px solid var(--color-borde-suave); border-radius: calc(var(--radio-borde)*1.5); padding: 1.5rem; box-shadow: var(--sombra); }
.admin-bloque__cabecera { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.admin-filtros { display: flex; gap: .625rem; flex-wrap: wrap; align-items: center; }
.admin-input  { padding: .5rem .75rem; border: 1.5px solid var(--color-borde-suave); border-radius: var(--radio-borde); font-size: .875rem; min-width: 200px; }
.admin-input--fecha { min-width: 130px; }
.admin-select { padding: .5rem .75rem; border: 1.5px solid var(--color-borde-suave); border-radius: var(--radio-borde); font-size: .875rem; background: #fff; }

/* Tabla */
.tabla-wrapper { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: .875rem; }
.tabla th { text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; color: var(--color-texto-suave); padding: .5rem .75rem; border-bottom: 2px solid var(--color-borde-suave); white-space: nowrap; }
.tabla td { padding: .625rem .75rem; border-bottom: 1px solid var(--color-borde-suave); vertical-align: middle; }
.tabla tbody tr:last-child td { border-bottom: none; }
.tabla tbody tr:hover { background: var(--color-fondo); }
.td-suave  { color: var(--color-texto-suave); font-size: .8125rem; }
.td-nowrap { white-space: nowrap; }

/* Chips */
.chip-rol { display: inline-block; padding: .125rem .625rem; border-radius: 9999px; font-size: .75rem; font-weight: 600; text-transform: capitalize; }
.chip-rol--cliente     { background: #dbeafe; color: #1e40af; }
.chip-rol--profesional { background: #d1fae5; color: #065f46; }
.chip-rol--admin       { background: #fef3c7; color: #92400e; }
.chip-verde { display: inline-block; padding: .125rem .625rem; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: .75rem; font-weight: 600; }
.chip-rojo  { display: inline-block; padding: .125rem .625rem; background: #fee2e2; color: #991b1b; border-radius: 9999px; font-size: .75rem; font-weight: 600; }

/* Acciones */
.acciones-fila { display: flex; gap: .375rem; flex-wrap: wrap; }
.boton-xs { padding: .3rem .65rem; font-size: .8125rem; }
.boton-peligro { border: 1.5px solid #ef4444; color: #ef4444; background: transparent; border-radius: var(--radio-borde); cursor: pointer; font-weight: 600; transition: background .15s; }
.boton-peligro:hover { background: #fee2e2; }

/* Paginación */
.paginacion { display: flex; gap: .375rem; justify-content: center; margin-top: 1.25rem; flex-wrap: wrap; }
.paginacion__btn { padding: .375rem .75rem; border: 1px solid var(--color-borde-suave); border-radius: var(--radio-borde); background: #fff; cursor: pointer; font-size: .875rem; color: var(--color-texto-medio); transition: border-color .15s; }
.paginacion__btn:hover { border-color: var(--color-primario); color: var(--color-primario); }
.paginacion__btn--activo { background: var(--color-primario); border-color: var(--color-primario); color: #fff; font-weight: 600; }

.campo-fila { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
</style>
