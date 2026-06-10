<template>
  <div>
    <div class="layout-panel__encabezado" style="display:flex;align-items:center;justify-content:space-between">
      <h1 class="layout-panel__titulo-pagina">Mis Servicios</h1>
      <button class="boton-principal" @click="mostrarFormServicio = !mostrarFormServicio">
        {{ mostrarFormServicio ? '✕ Cancelar' : '+ Nuevo servicio' }}
      </button>
    </div>

    <!-- Formulario nuevo servicio (ubicación se despliega dentro si es presencial/híbrida) -->
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

        <!-- Ubicación: se despliega solo cuando es presencial o híbrida -->
        <template v-if="nuevoServicio.modalidad !== 'remota'">
          <hr style="margin:1.25rem 0;border:none;border-top:1px solid var(--color-borde-suave)" />
          <div class="perfil-seccion-cabecera">
            <h3 class="perfil-seccion-titulo">Ubicación del encuentro</h3>
            <span class="perfil-seccion-tag">Presencial / Híbrida</span>
          </div>
          <p class="perfil-seccion-desc">
            Definí la ubicación donde atenderás al cliente. Se mostrará al reservar.
          </p>
          <div class="campo">
            <label>Dirección</label>
            <input v-model="configProf.form.direccion" placeholder="Ej: Av. 18 de Julio 1234" />
          </div>
          <div class="campo-fila">
            <div class="campo">
              <label>Ciudad</label>
              <input v-model="configProf.form.ciudad" placeholder="Ej: Montevideo" />
            </div>
            <div class="campo">
              <label>País</label>
              <input v-model="configProf.form.pais" placeholder="Ej: UY" maxlength="3" />
            </div>
          </div>
          <div class="perfil-mapa-bloque">
            <MapaUbicacion
              :latitud="configProf.form.latitud"
              :longitud="configProf.form.longitud"
              @update:latitud="configProf.form.latitud = $event"
              @update:longitud="configProf.form.longitud = $event"
              editable
              titulo="Seleccioná la ubicación en el mapa"
              subtitulo="Hacé clic en el punto exacto donde atenderás"
              ayuda="También podés mover el marcador arrastrándolo una vez colocado."
              height="280px"
            />
            <div class="perfil-mapa-acciones">
              <button type="button" class="boton-secundario" @click="usarUbicacionActual">
                📍 Usar mi ubicación actual
              </button>
              <div class="perfil-coordenadas">
                <span>Lat: {{ mostrarCoordenadas(configProf.form.latitud) }}</span>
                <span>Lng: {{ mostrarCoordenadas(configProf.form.longitud) }}</span>
              </div>
            </div>
          </div>
          <div class="campo" style="margin-top:1rem">
            <label>Horas mínimas para cancelar</label>
            <input v-model.number="configProf.form.horas_cancelacion" type="number" min="0" max="168" step="1" />
            <small class="campo-ayuda">Antelación mínima para cancelar una reserva.</small>
          </div>
          <p v-if="configProf.mensajeExito" class="alerta alerta--exito">{{ configProf.mensajeExito }}</p>
          <p v-if="configProf.mensajeError"  class="alerta alerta--error">{{ configProf.mensajeError }}</p>
        </template>

        <div style="display:flex;justify-content:flex-end;gap:.75rem;margin-top:1.25rem">
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

        <!-- Sección expandible con tabs: Paquetes y Ubicaciones -->
        <div v-if="expandidos.has(servicio.id)" class="servicio-detalles">
          <!-- Tabs -->
          <div class="tabs-servicio">
            <button 
              :class="['tab-btn', (tabActivoPorServicio[servicio.id] ?? 'paquetes') === 'paquetes' && 'tab-btn--activo']"
              @click="tabActivoPorServicio[servicio.id] = 'paquetes'">
              📦 Paquetes
            </button>
            <button 
              :class="['tab-btn', tabActivoPorServicio[servicio.id] === 'ubicaciones' && 'tab-btn--activo']"
              @click="tabActivoPorServicio[servicio.id] = 'ubicaciones'">
              📍 Ubicaciones
            </button>
          </div>

          <!-- Tab: Paquetes -->
          <div v-if="(tabActivoPorServicio[servicio.id] ?? 'paquetes') === 'paquetes'" class="tab-content">
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

          <!-- Tab: Ubicaciones -->
          <div v-if="tabActivoPorServicio[servicio.id] === 'ubicaciones'" class="tab-content">

            <!-- Sub-tabs -->
            <div class="tabs-servicio" style="margin-bottom:.75rem">
              <button :class="['tab-btn', (tabUbicacion[servicio.id] ?? 'guardadas') === 'guardadas' && 'tab-btn--activo']"
                @click="tabUbicacion[servicio.id] = 'guardadas'; cargarUbicacionesGuardadas()">
                📍 Guardadas ({{ ubicacionesGuardadas.length }})
              </button>
              <button :class="['tab-btn', tabUbicacion[servicio.id] === 'nueva' && 'tab-btn--activo']"
                @click="tabUbicacion[servicio.id] = 'nueva'">
                🗺️ Modificar ubi
              </button>
              <button v-if="servicio.ubicacion"
                :class="['tab-btn', tabUbicacion[servicio.id] === 'asignada' && 'tab-btn--activo']"
                @click="tabUbicacion[servicio.id] = 'asignada'">
                ✅ Asignada
              </button>
            </div>

            <!-- Guardadas: lista para asignar -->
            <div v-if="(tabUbicacion[servicio.id] ?? 'guardadas') === 'guardadas'">
              <div v-if="cargandoUbicacionesGuardadas" class="cargando" style="padding:1rem">Cargando...</div>
              <template v-else-if="ubicacionesGuardadas.length">
                <div v-for="ub in ubicacionesGuardadas" :key="ub.id" class="ubicacion-item">
                  <div>
                    <p style="font-weight:700;margin:0">{{ ub.nombre }}</p>
                    <p v-if="ub.direccion" class="td-suave" style="margin:0;font-size:.8125rem">📍 {{ ub.direccion }}, {{ ub.ciudad }}</p>
                  </div>
                  <button class="boton-principal boton-sm"
                    :disabled="servicio.ubicacion?.id === ub.id"
                    @click="asignarUbicacion(servicio, ub)">
                    {{ servicio.ubicacion?.id === ub.id ? '✓ Asignada' : 'Asignar' }}
                  </button>
                </div>
              </template>
              <div v-else class="paquetes-vacio">No hay ubicaciones guardadas. Creá una en "Modificar ubi".</div>
            </div>

            <!-- Nueva ubicación con Leaflet -->
            <div v-if="tabUbicacion[servicio.id] === 'nueva'">
              <div class="perfil-seccion-cabecera">
                <h3 class="perfil-seccion-titulo">Ubicación del encuentro</h3>
                <span class="perfil-seccion-tag">Presencial / Híbrida</span>
              </div>
              <p class="perfil-seccion-desc">
                Definí la ubicación donde atenderás al cliente. Se mostrará al reservar.
              </p>
              <div class="campo">
                <label>Dirección</label>
                <input v-model="formNuevaUbicacion.direccion" placeholder="Ej: Av. 18 de Julio 1234" />
              </div>
              <div class="campo-fila">
                <div class="campo">
                  <label>Ciudad</label>
                  <input v-model="formNuevaUbicacion.ciudad" placeholder="Ej: Montevideo" />
                </div>
                <div class="campo">
                  <label>País</label>
                  <input v-model="formNuevaUbicacion.pais" placeholder="Ej: UY" maxlength="3" />
                </div>
              </div>
              <div class="perfil-mapa-bloque">
                <MapaUbicacion
                  :latitud="formNuevaUbicacion.latitud"
                  :longitud="formNuevaUbicacion.longitud"
                  @update:latitud="formNuevaUbicacion.latitud = $event"
                  @update:longitud="formNuevaUbicacion.longitud = $event"
                  editable
                  titulo="Hacé clic en el mapa para marcar la ubicación"
                  subtitulo="El servidor completa la dirección automáticamente."
                  ayuda="También podés mover el marcador arrastrándolo una vez colocado."
                  height="280px"
                />
                <div class="perfil-mapa-acciones">
                  <button type="button" class="boton-secundario" @click="usarUbicacionActualEnServicio">
                    📍 Usar mi ubicación actual
                  </button>
                  <div class="perfil-coordenadas">
                    <span>Lat: {{ mostrarCoordenadas(formNuevaUbicacion.latitud) }}</span>
                    <span>Lng: {{ mostrarCoordenadas(formNuevaUbicacion.longitud) }}</span>
                  </div>
                </div>
              </div>
              <p v-if="formNuevaUbicacion.error" class="alerta alerta--error">{{ formNuevaUbicacion.error }}</p>
              <div style="display:flex;justify-content:flex-end;gap:.5rem;margin-top:.75rem">
                <button type="button" class="boton-secundario boton-sm" @click="resetFormUbicacion">Cancelar</button>
                <button type="button" class="boton-principal boton-sm"
                  :disabled="!formNuevaUbicacion.latitud || formNuevaUbicacion.guardando"
                  @click="crearYAsignarUbicacion(servicio)">
                  {{ formNuevaUbicacion.guardando ? 'Guardando...' : '✓ Asignar ubicación' }}
                </button>
              </div>
            </div>

            <!-- Asignada actualmente -->
            <div v-if="tabUbicacion[servicio.id] === 'asignada' && servicio.ubicacion">
              <div class="ubicacion-item" style="margin-bottom:.75rem">
                <div>
                  <p style="font-weight:700;margin:0">{{ servicio.ubicacion.nombre }}</p>
                  <p v-if="servicio.ubicacion.direccion" class="td-suave" style="margin:.125rem 0 0;font-size:.8125rem">
                    📍 {{ servicio.ubicacion.direccion }}, {{ servicio.ubicacion.ciudad }}
                  </p>
                </div>
                <button class="boton-secundario boton-sm" @click="desasignarUbicacion(servicio)">✕ Remover</button>
              </div>
              <MapaUbicacion
                :latitud="servicio.ubicacion.latitud"
                :longitud="servicio.ubicacion.longitud"
                height="220px"
              />
            </div>

          </div>
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
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { getEcho } from '@/services/echo'
import { useConfirm } from '@/composables/useConfirm.js'
import MapaUbicacion from '@/components/MapaUbicacion.vue'

const auth = useAuthStore()
const profesionalId = auth.usuario?.profesional?.id
const { confirmar } = useConfirm()
let canalServicios = null

// ── Configuración del profesional (ubicación + cancelación) ──────────────────
const configProf = ref({
  guardando: false,
  mensajeExito: '',
  mensajeError: '',
  form: {
    modalidad:          auth.usuario?.profesional?.modalidad          || 'hibrida',
    direccion:          auth.usuario?.profesional?.direccion          || '',
    ciudad:             auth.usuario?.profesional?.ciudad             || '',
    pais:               auth.usuario?.profesional?.pais               || 'UY',
    latitud:            auth.usuario?.profesional?.latitud            ?? null,
    longitud:           auth.usuario?.profesional?.longitud           ?? null,
    horas_cancelacion:  auth.usuario?.profesional?.horas_cancelacion  ?? 24,
  },
})

function mostrarCoordenadas(valor) {
  const n = Number(valor)
  return Number.isFinite(n) ? n.toFixed(6) : '—'
}

function usarUbicacionActual() {
  configProf.value.mensajeError = ''
  if (!navigator.geolocation) {
    configProf.value.mensajeError = 'Tu navegador no soporta geolocalización.'
    return
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      configProf.value.form.latitud  = coords.latitude
      configProf.value.form.longitud = coords.longitude
      configProf.value.mensajeExito  = 'Ubicación actual detectada. Guardá los cambios.'
    },
    () => { configProf.value.mensajeError = 'No se pudo obtener tu ubicación actual.' },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

function usarUbicacionActualEnServicio() {
  if (!navigator.geolocation) {
    formNuevaUbicacion.error = 'Tu navegador no soporta geolocalización.'
    return
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      formNuevaUbicacion.latitud  = coords.latitude
      formNuevaUbicacion.longitud = coords.longitude
    },
    () => { formNuevaUbicacion.error = 'No se pudo obtener tu ubicación actual.' },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

async function guardarConfigProf() {
  if (!auth.usuario?.profesional?.id) return
  configProf.value.guardando     = true
  configProf.value.mensajeExito  = ''
  configProf.value.mensajeError  = ''
  const f = configProf.value.form
  const remota = f.modalidad === 'remota'
  try {
    const { data } = await axios.put(`/api/profesionales/${auth.usuario.profesional.id}`, {
      modalidad:         f.modalidad,
      direccion:         remota ? null : f.direccion,
      ciudad:            remota ? null : f.ciudad,
      pais:              remota ? null : f.pais,
      latitud:           remota ? null : f.latitud,
      longitud:          remota ? null : f.longitud,
      horas_cancelacion: f.horas_cancelacion,
    })
    auth.usuario.profesional = { ...auth.usuario.profesional, ...data }
    localStorage.setItem('usuario', JSON.stringify(auth.usuario))
    configProf.value.mensajeExito = 'Configuración guardada correctamente.'
    setTimeout(() => { configProf.value.mensajeExito = '' }, 3000)
  } catch (e) {
    configProf.value.mensajeError = e.response?.data?.message || 'No se pudo guardar.'
  } finally {
    configProf.value.guardando = false
  }
}

const servicios          = ref([])
const mostrarFormServicio = ref(false)
const cargando           = ref(false)
const guardando          = ref(false)
const errorForm          = ref('')

// Paquetes por servicio
const expandidos        = reactive(new Set())
const paquetesPorServicio = reactive({})
const cargandoPaquetes  = reactive(new Set())

// Tab activo por servicio (paquetes o ubicaciones)
const tabActivoPorServicio = reactive({})

// ── Ubicaciones ───────────────────────────────────────────────────────────────
const tabUbicacion                = reactive({})
const ubicacionesGuardadas        = ref([])
const cargandoUbicacionesGuardadas = ref(false)
const formNuevaUbicacion = reactive({
  nombre: '', latitud: null, longitud: null, direccion: '', ciudad: '', pais: '',
  guardando: false, error: '',
})

const geocodificandoUbicacionProfesional = ref(false)
const geocodificandoNuevaUbicacion = ref(false)

function resetFormUbicacion() {
  Object.assign(formNuevaUbicacion, {
    nombre: '', latitud: null, longitud: null, direccion: '', ciudad: '', pais: '',
    guardando: false, error: '',
  })
}

async function cargarUbicacionesGuardadas() {
  if (ubicacionesGuardadas.value.length) return
  cargandoUbicacionesGuardadas.value = true
  try {
    const { data } = await axios.get('/api/ubicaciones')
    ubicacionesGuardadas.value = data
  } finally {
    cargandoUbicacionesGuardadas.value = false
  }
}

function formatearDireccionDesdeAddress(address) {
  if (!address) return ''
  const partes = []
  if (address.road) partes.push(address.road)
  if (address.house_number) partes.push(address.house_number)
  if (address.neighbourhood) partes.push(address.neighbourhood)
  if (address.suburb) partes.push(address.suburb)
  return partes.join(' ').trim() || address.display_name || ''
}

function obtenerCiudadDesdeAddress(address) {
  return address.city || address.town || address.village || address.county || ''
}

function obtenerPaisDesdeAddress(address) {
  return (address.country_code || address.country || '').toUpperCase()
}

async function obtenerDireccionPorCoordenadas(lat, lon) {
  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1,
        zoom: 18,
        'accept-language': 'es',
      },
    })
    return data.address || null
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return null
  }
}

watch(
  () => [configProf.value.form.latitud, configProf.value.form.longitud],
  async ([lat, lon]) => {
    if (lat == null || lon == null) return
    geocodificandoUbicacionProfesional.value = true
    try {
      const address = await obtenerDireccionPorCoordenadas(lat, lon)
      if (!address) return
      configProf.value.form.direccion = formatearDireccionDesdeAddress(address) || configProf.value.form.direccion
      configProf.value.form.ciudad = obtenerCiudadDesdeAddress(address) || configProf.value.form.ciudad
      configProf.value.form.pais = obtenerPaisDesdeAddress(address) || configProf.value.form.pais
    } finally {
      geocodificandoUbicacionProfesional.value = false
    }
  }
)

watch(
  () => [formNuevaUbicacion.latitud, formNuevaUbicacion.longitud],
  async ([lat, lon]) => {
    if (lat == null || lon == null) return
    geocodificandoNuevaUbicacion.value = true
    try {
      const address = await obtenerDireccionPorCoordenadas(lat, lon)
      if (!address) return
      formNuevaUbicacion.direccion = formatearDireccionDesdeAddress(address) || formNuevaUbicacion.direccion
      formNuevaUbicacion.ciudad = obtenerCiudadDesdeAddress(address) || formNuevaUbicacion.ciudad
      formNuevaUbicacion.pais = obtenerPaisDesdeAddress(address) || formNuevaUbicacion.pais
    } finally {
      geocodificandoNuevaUbicacion.value = false
    }
  }
)

async function asignarUbicacion(servicio, ubicacion) {
  try {
    await axios.post(`/api/servicios/${servicio.id}/ubicaciones/${ubicacion.id}`)
    servicio.ubicacion = ubicacion
    tabUbicacion[servicio.id] = 'asignada'
  } catch (e) {
    if (e.response?.status !== 409) console.error(e)
  }
}

async function desasignarUbicacion(servicio) {
  try {
    await axios.delete(`/api/servicios/${servicio.id}/ubicaciones/${servicio.ubicacion.id}`)
    servicio.ubicacion = null
    tabUbicacion[servicio.id] = 'guardadas'
  } catch (e) {
    console.error(e)
  }
}

async function crearYAsignarUbicacion(servicio) {
  formNuevaUbicacion.error    = ''
  formNuevaUbicacion.guardando = true
  try {
    // Generar nombre automático si no existe
    const nombre = formNuevaUbicacion.nombre || 
      (formNuevaUbicacion.ciudad || 'Ubicación') + ' - ' + new Date().toLocaleDateString('es-UY')
    
    const { data: nuevaUbicacion } = await axios.post('/api/ubicaciones', {
      nombre,
      latitud:  formNuevaUbicacion.latitud,
      longitud: formNuevaUbicacion.longitud,
      direccion: formNuevaUbicacion.direccion || undefined,
      ciudad:    formNuevaUbicacion.ciudad    || undefined,
      pais:      formNuevaUbicacion.pais      || undefined,
    })
    ubicacionesGuardadas.value.push(nuevaUbicacion)
    await asignarUbicacion(servicio, nuevaUbicacion)
    resetFormUbicacion()
  } catch (e) {
    formNuevaUbicacion.error = e.response?.data?.message || 'Error al guardar la ubicación.'
  } finally {
    formNuevaUbicacion.guardando = false
  }
}

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
    // Si es presencial/híbrida, guardar ubicación del profesional primero
    if (nuevoServicio.value.modalidad !== 'remota') {
      configProf.value.form.modalidad = nuevoServicio.value.modalidad
      await guardarConfigProf()
    }
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
  if (!await confirmar(`¿Desactivar el paquete "${paquete.nombre}"? Los clientes que ya lo compraron no se ven afectados.`)) return
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

function suscribirServicios() {
  const echo = getEcho()
  if (!echo || !profesionalId) return

  const nuevoCanal = `profesionales.${profesionalId}.servicios`
  if (canalServicios === nuevoCanal) return

  if (canalServicios) {
    try {
      echo.leave(canalServicios)
    } catch (error) {
      console.warn('No se pudo salir del canal anterior de servicios.', error)
    }
  }

  canalServicios = nuevoCanal

  echo.channel(nuevoCanal).listen('.servicio.actualizado', () => {
    cargarServicios()
  })
}

function limpiarSuscripcionServicios() {
  const echo = getEcho()
  if (echo && canalServicios) {
    try {
      echo.leave(canalServicios)
    } catch (error) {
      console.warn('No se pudo limpiar el canal de servicios.', error)
    }
  }

  canalServicios = null
}

onMounted(() => {
  cargarServicios()
  suscribirServicios()
})

watch(() => auth.usuario?.profesional?.id, () => {
  suscribirServicios()
})

onBeforeUnmount(() => {
  limpiarSuscripcionServicios()
})
</script>

