<template>
  <div class="mapa-editor-ubicacion">
    <div class="mapa-editor-header">
      <h3>Ubicaciones del servicio</h3>
      <p class="mapa-editor-subtitle">Haz click en el mapa para seleccionar una ubicación o reutiliza una guardada</p>
    </div>

    <!-- Tabs: Ubicaciones guardadas vs Nueva ubicación -->
    <div class="tabs-ubicacion">
      <button 
        :class="['tab-btn', tabActivo === 'guardadas' && 'tab-btn--activo']"
        @click="tabActivo = 'guardadas'">
        📍 Ubicaciones guardadas ({{ ubicacionesGuardadas.length }})
      </button>
      <button 
        :class="['tab-btn', tabActivo === 'nueva' && 'tab-btn--activo']"
        @click="tabActivo = 'nueva'">
        🗺️ Agregar nueva
      </button>
      <button 
        v-if="ubicacionesServicio.length"
        :class="['tab-btn', tabActivo === 'servicio' && 'tab-btn--activo']"
        @click="tabActivo = 'servicio'">
        ✅ Asignadas al servicio ({{ ubicacionesServicio.length }})
      </button>
    </div>

    <!-- Tab: Ubicaciones guardadas (reutilizar) -->
    <div v-show="tabActivo === 'guardadas'" class="tab-content">
      <div v-if="cargandoUbicaciones" class="cargando">
        Cargando ubicaciones...
      </div>
      <template v-else-if="ubicacionesGuardadas.length">
        <div class="ubicaciones-lista">
          <div v-for="ub in ubicacionesGuardadas" :key="ub.id" class="ubicacion-item">
            <div class="ubicacion-item__info">
              <p class="ubicacion-item__nombre">{{ ub.nombre }}</p>
              <p class="ubicacion-item__direccion" v-if="ub.direccion">
                📍 {{ ub.direccion }}
              </p>
              <p class="ubicacion-item__ciudad" v-if="ub.ciudad">
                🏙️ {{ ub.ciudad }}, {{ ub.pais }}
              </p>
              <p class="ubicacion-item__coords">
                <small>{{ ub.latitud.toFixed(6) }}, {{ ub.longitud.toFixed(6) }}</small>
              </p>
            </div>
            <button 
              class="boton-principal boton-sm"
              @click="asignarUbicacionServicio(ub)"
              :disabled="ubicacionesServicio.some(u => u.id === ub.id)">
              {{ ubicacionesServicio.some(u => u.id === ub.id) ? '✓ Asignada' : 'Asignar' }}
            </button>
          </div>
        </div>
      </template>
      <div v-else class="estado-vacio">
        <p>No hay ubicaciones guardadas aún. Crea una en la pestaña "Agregar nueva".</p>
      </div>
    </div>

    <!-- Tab: Nueva ubicación (con mapa) -->
    <div v-show="tabActivo === 'nueva'" class="tab-content">
      <div class="mapa-container">
        <!-- Google Map -->
        <div ref="mapContainer" class="mapa-google" style="height: 400px; width: 100%"></div>
        
        <!-- Indicador de click -->
        <p v-if="!formulario.ubicacionSeleccionada" class="mapa-hint">
          👆 Haz click en el mapa para marcar la ubicación
        </p>
      </div>

      <!-- Formulario de nueva ubicación -->
      <div v-if="formulario.ubicacionSeleccionada" class="formulario-ubicacion">
        <div class="campo">
          <label>Nombre de la ubicación *</label>
          <input 
            v-model="formulario.nombre"
            type="text"
            placeholder="Ej: Consultorio 1, Oficina, Centro"
            required>
          <small class="campo-ayuda">Este nombre te ayudará a identificar la ubicación</small>
        </div>

        <div class="campo-fila">
          <div class="campo">
            <label>Latitud</label>
            <input 
              v-model="formulario.latitud"
              type="number"
              step="0.000001"
              readonly
              class="campo-deshabilitado">
          </div>
          <div class="campo">
            <label>Longitud</label>
            <input 
              v-model="formulario.longitud"
              type="number"
              step="0.000001"
              readonly
              class="campo-deshabilitado">
          </div>
        </div>

        <!-- Auto-rellenado por reverse geocoding -->
        <div class="campo">
          <label>Dirección</label>
          <input 
            v-model="formulario.direccion"
            type="text"
            placeholder="Auto-rellenada por maps"
            @change="markerUbicacion.direccion = formulario.direccion">
          <small class="campo-ayuda" v-if="formulario.geocodificando">
            ⏳ Buscando dirección...
          </small>
        </div>

        <div class="campo-fila">
          <div class="campo">
            <label>Ciudad</label>
            <input 
              v-model="formulario.ciudad"
              type="text"
              placeholder="Auto-rellenada por maps"
              @change="markerUbicacion.ciudad = formulario.ciudad">
          </div>
          <div class="campo">
            <label>País</label>
            <input 
              v-model="formulario.pais"
              type="text"
              placeholder="Auto-rellenada por maps"
              @change="markerUbicacion.pais = formulario.pais">
          </div>
        </div>

        <p v-if="formulario.error" class="alerta alerta--error">
          {{ formulario.error }}
        </p>

        <div class="botones-formulario">
          <button 
            class="boton-secundario"
            @click="limpiarFormulario">
            Cancelar
          </button>
          <button 
            class="boton-principal"
            :disabled="!formulario.nombre || formulario.guardando"
            @click="guardarUbicacion">
            {{ formulario.guardando ? 'Guardando...' : '💾 Guardar ubicación' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tab: Ubicaciones asignadas al servicio -->
    <div v-show="tabActivo === 'servicio'" class="tab-content">
      <div v-if="ubicacionesServicio.length" class="ubicaciones-lista">
        <div v-for="ub in ubicacionesServicio" :key="ub.id" class="ubicacion-item">
          <div class="ubicacion-item__info">
            <p class="ubicacion-item__nombre">{{ ub.nombre }}</p>
            <p class="ubicacion-item__direccion" v-if="ub.direccion">
              📍 {{ ub.direccion }}
            </p>
            <p class="ubicacion-item__ciudad" v-if="ub.ciudad">
              🏙️ {{ ub.ciudad }}, {{ ub.pais }}
            </p>
          </div>
          <button 
            class="boton-secundario boton-sm"
            @click="desasignarUbicacionServicio(ub)">
            ✕ Remover
          </button>
        </div>
      </div>
      <div v-else class="estado-vacio">
        <p>Este servicio no tiene ubicaciones asignadas aún.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  servicioId: {
    type: [Number, String],
    required: true,
  },
  googleMapsApiKey: {
    type: String,
    required: true, // Debe ser proporcionado por componente padre
  },
})

// ─── Estado general ────────────────────────────────────────────────────────
const tabActivo = ref('guardadas')
const cargandoUbicaciones = ref(false)
const ubicacionesGuardadas = ref([])
const ubicacionesServicio = ref([])

// ─── Mapa y marker ────────────────────────────────────────────────────────
const mapContainer = ref(null)
let mapa = null
let marker = null

// ─── Formulario ────────────────────────────────────────────────────────────
const formulario = ref({
  nombre: '',
  latitud: null,
  longitud: null,
  direccion: '',
  ciudad: '',
  pais: '',
  error: '',
  ubicacionSeleccionada: false,
  geocodificando: false,
  guardando: false,
})

const markerUbicacion = ref({
  nombre: '',
  latitud: null,
  longitud: null,
  direccion: '',
  ciudad: '',
  pais: '',
})

// ─── Ciclo de vida ────────────────────────────────────────────────────────
onMounted(async () => {
  await cargarUbicaciones()
  await cargarUbicacionesServicio()
  await inicializarMapa()
})

// ─── Funciones principales ────────────────────────────────────────────────

async function cargarUbicaciones() {
  cargandoUbicaciones.value = true
  try {
    const { data } = await axios.get('/api/ubicaciones')
    ubicacionesGuardadas.value = data
  } catch (error) {
    console.error('Error cargando ubicaciones:', error)
  } finally {
    cargandoUbicaciones.value = false
  }
}

async function cargarUbicacionesServicio() {
  try {
    const { data } = await axios.get(`/api/servicios/${props.servicioId}/ubicaciones`)
    ubicacionesServicio.value = data
  } catch (error) {
    console.error('Error cargando ubicaciones del servicio:', error)
  }
}

async function inicializarMapa() {
  if (!mapContainer.value) return

  // Crear mapa centrado en Buenos Aires por defecto
  const mapOptions = {
    zoom: 15,
    center: { lat: -34.6037, lng: -58.3816 },
    mapTypeControl: false,
    fullscreenControl: false,
  }

  mapa = new google.maps.Map(mapContainer.value, mapOptions)

  // Agregar listener para clicks en el mapa
  mapa.addListener('click', (event) => {
    seleccionarUbicacionMapa(event.latLng)
  })
}

function seleccionarUbicacionMapa(latLng) {
  // Limpiar marker anterior
  if (marker) {
    marker.setMap(null)
  }

  // Crear nuevo marker
  marker = new google.maps.Marker({
    position: latLng,
    map: mapa,
    title: 'Ubicación seleccionada',
  })

  // Actualizar formulario
  formulario.value.latitud = latLng.lat()
  formulario.value.longitud = latLng.lng()
  formulario.value.ubicacionSeleccionada = true
  formulario.value.geocodificando = true

  // Reverse geocoding
  reverseGeocoding(latLng)
}

function reverseGeocoding(latLng) {
  const geocoder = new google.maps.Geocoder()

  geocoder.geocode({ location: latLng }, (results, status) => {
    formulario.value.geocodificando = false

    if (status === 'OK' && results[0]) {
      const address = results[0]
      const addressComponents = address.address_components

      // Extraer dirección
      formulario.value.direccion = address.formatted_address.split(',')[0]

      // Extraer ciudad
      const cityComponent = addressComponents.find(comp => 
        comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
      )
      formulario.value.ciudad = cityComponent?.long_name || ''

      // Extraer país
      const countryComponent = addressComponents.find(comp => 
        comp.types.includes('country')
      )
      formulario.value.pais = countryComponent?.long_name || ''

      // Actualizar marker ubicación
      markerUbicacion.value = {
        ...formulario.value,
      }
    }
  })
}

async function guardarUbicacion() {
  formulario.value.error = ''
  formulario.value.guardando = true

  try {
    const { data } = await axios.post('/api/ubicaciones', {
      nombre: formulario.value.nombre,
      latitud: formulario.value.latitud,
      longitud: formulario.value.longitud,
      direccion: formulario.value.direccion,
      ciudad: formulario.value.ciudad,
      pais: formulario.value.pais,
    })

    ubicacionesGuardadas.value.push(data)
    
    // Asignar automáticamente al servicio
    await asignarUbicacionServicio(data)

    limpiarFormulario()
  } catch (error) {
    formulario.value.error = error.response?.data?.error || 'Error al guardar la ubicación'
  } finally {
    formulario.value.guardando = false
  }
}

async function asignarUbicacionServicio(ubicacion) {
  try {
    await axios.post(`/api/servicios/${props.servicioId}/ubicaciones/${ubicacion.id}`)
    await cargarUbicacionesServicio()
  } catch (error) {
    if (error.response?.status !== 409) { // 409 = ya existe
      console.error('Error asignando ubicación:', error)
    }
  }
}

async function desasignarUbicacionServicio(ubicacion) {
  try {
    await axios.delete(`/api/servicios/${props.servicioId}/ubicaciones/${ubicacion.id}`)
    await cargarUbicacionesServicio()
  } catch (error) {
    console.error('Error desasignando ubicación:', error)
  }
}

function limpiarFormulario() {
  formulario.value = {
    nombre: '',
    latitud: null,
    longitud: null,
    direccion: '',
    ciudad: '',
    pais: '',
    error: '',
    ubicacionSeleccionada: false,
    geocodificando: false,
    guardando: false,
  }

  if (marker) {
    marker.setMap(null)
  }

  markerUbicacion.value = {
    nombre: '',
    latitud: null,
    longitud: null,
    direccion: '',
    ciudad: '',
    pais: '',
  }
}
</script>

<style scoped>
.mapa-editor-ubicacion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mapa-editor-header {
  margin-bottom: 0.5rem;
}

.mapa-editor-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.mapa-editor-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.tabs-ubicacion {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  overflow-x: auto;
}

.tab-btn {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn--activo {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.mapa-container {
  position: relative;
}

.mapa-google {
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.mapa-hint {
  text-align: center;
  color: #999;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

.ubicaciones-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ubicacion-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #f9f9f9;
  gap: 1rem;
}

.ubicacion-item__info {
  flex: 1;
  min-width: 0;
}

.ubicacion-item__nombre {
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #333;
}

.ubicacion-item__direccion {
  font-size: 0.9rem;
  color: #666;
  margin: 0.2rem 0;
}

.ubicacion-item__ciudad {
  font-size: 0.9rem;
  color: #666;
  margin: 0.2rem 0;
}

.ubicacion-item__coords {
  font-size: 0.85rem;
  color: #999;
  margin: 0.3rem 0 0 0;
}

.formulario-ubicacion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.campo label {
  font-weight: 500;
  font-size: 0.95rem;
  color: #333;
}

.campo input {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.campo input:not(.campo-deshabilitado):focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.campo-deshabilitado {
  background: #e8e8e8;
  color: #666;
  cursor: not-allowed;
}

.campo-fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.campo-ayuda {
  font-size: 0.8rem;
  color: #999;
}

.botones-formulario {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.boton-principal,
.boton-secundario {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.boton-principal {
  background: #007bff;
  color: white;
}

.boton-principal:hover:not(:disabled) {
  background: #0056b3;
}

.boton-principal:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.boton-secundario {
  background: #e0e0e0;
  color: #333;
}

.boton-secundario:hover:not(:disabled) {
  background: #d0d0d0;
}

.boton-sm {
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
}

.cargando {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.estado-vacio {
  text-align: center;
  padding: 2rem;
  color: #999;
  background: #f9f9f9;
  border-radius: 6px;
}

.alerta {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.95rem;
}

.alerta--error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}
</style>
