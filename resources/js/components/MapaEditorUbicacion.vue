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

    <!-- Tab: Nueva ubicación -->
    <div v-show="tabActivo === 'nueva'" class="tab-content">
      <div v-if="mapsDisponibles" class="mapa-container">
        <!-- Google Map -->
        <div ref="mapContainer" class="mapa-google" style="height: 400px; width: 100%"></div>
        
        <!-- Indicador de click -->
        <p v-if="!formulario.ubicacionSeleccionada" class="mapa-hint">
          👆 Haz click en el mapa para marcar la ubicación
        </p>
      </div>

      <div v-else class="alerta alerta--info" style="margin-bottom: 1rem;">
        Google Maps no está disponible en esta instalación. Podés cargar la ubicación manualmente con latitud y longitud.
      </div>

      <!-- Formulario de nueva ubicación -->
      <div v-if="formulario.ubicacionSeleccionada || !mapsDisponibles" class="formulario-ubicacion">
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
              :readonly="mapsDisponibles"
              :class="mapsDisponibles ? 'campo-deshabilitado' : ''"
              placeholder="-34.6037">
          </div>
          <div class="campo">
            <label>Longitud</label>
            <input 
              v-model="formulario.longitud"
              type="number"
              step="0.000001"
              :readonly="mapsDisponibles"
              :class="mapsDisponibles ? 'campo-deshabilitado' : ''"
              placeholder="-58.3816">
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
    required: false,
  },
})

// ─── Estado general ────────────────────────────────────────────────────────
const tabActivo = ref('guardadas')
const cargandoUbicaciones = ref(false)
const ubicacionesGuardadas = ref([])
const ubicacionesServicio = ref([])
const mapsDisponibles = computed(() => Boolean(props.googleMapsApiKey && window.google && window.google.maps))

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
  if (!mapContainer.value || !mapsDisponibles.value) return

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
