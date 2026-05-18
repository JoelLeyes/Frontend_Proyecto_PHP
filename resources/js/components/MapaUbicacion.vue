<template>
  <div class="mapa-ubicacion">
    <div v-if="titulo || subtitulo" class="mapa-ubicacion__encabezado">
      <div>
        <p v-if="titulo" class="mapa-ubicacion__titulo">{{ titulo }}</p>
        <p v-if="subtitulo" class="mapa-ubicacion__subtitulo">{{ subtitulo }}</p>
      </div>
      <span v-if="editable" class="mapa-ubicacion__tag">Editable</span>
    </div>

    <div ref="contenedor" class="mapa-ubicacion__mapa" :style="{ height }"></div>

    <div v-if="muestraCoordenadas" class="mapa-ubicacion__coordenadas">
      <span>Lat: {{ latitudC }}</span>
      <span>Lng: {{ longitudC }}</span>
    </div>

    <p v-if="editable && ayuda" class="mapa-ubicacion__ayuda">{{ ayuda }}</p>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  latitud: { type: [Number, String], default: null },
  longitud: { type: [Number, String], default: null },
  editable: { type: Boolean, default: false },
  titulo: { type: String, default: '' },
  subtitulo: { type: String, default: '' },
  ayuda: { type: String, default: '' },
  height: { type: String, default: '280px' },
  zoom: { type: Number, default: 15 },
})

const emit = defineEmits(['update:latitud', 'update:longitud', 'change'])

const contenedor = ref(null)
let mapa = null
let marcador = null

const centerDefault = [-34.901112, -56.164532]

const latitudC = computed(() => Number(props.latitud).toFixed(6))
const longitudC = computed(() => Number(props.longitud).toFixed(6))
const tieneCoordenadas = computed(() => Number.isFinite(Number(props.latitud)) && Number.isFinite(Number(props.longitud)))
const muestraCoordenadas = computed(() => tieneCoordenadas.value)

function crearIcono() {
  return L.divIcon({
    className: 'mapa-ubicacion__marker',
    html: '<span class="mapa-ubicacion__pin">📍</span>',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

function actualizarMarcador(latitud, longitud, centrar = true) {
  if (!mapa) return
  const latlng = L.latLng(latitud, longitud)

  if (!marcador) {
    marcador = L.marker(latlng, { icon: crearIcono(), draggable: props.editable }).addTo(mapa)
    if (props.editable) {
      marcador.on('dragend', () => {
        const posicion = marcador.getLatLng()
        emit('update:latitud', posicion.lat)
        emit('update:longitud', posicion.lng)
        emit('change', { latitud: posicion.lat, longitud: posicion.lng })
      })
    }
  } else {
    marcador.setLatLng(latlng)
  }

  if (centrar) {
    mapa.setView(latlng, props.zoom)
  }
}

function inicializarMapa() {
  if (!contenedor.value || mapa) return

  mapa = L.map(contenedor.value, {
    center: tieneCoordenadas.value ? [Number(props.latitud), Number(props.longitud)] : centerDefault,
    zoom: props.zoom,
    scrollWheelZoom: props.editable,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapa)

  if (tieneCoordenadas.value) {
    actualizarMarcador(Number(props.latitud), Number(props.longitud), false)
  }

  if (props.editable) {
    mapa.on('click', (evento) => {
      actualizarMarcador(evento.latlng.lat, evento.latlng.lng, false)
      emit('update:latitud', evento.latlng.lat)
      emit('update:longitud', evento.latlng.lng)
      emit('change', { latitud: evento.latlng.lat, longitud: evento.latlng.lng })
    })
  }
}

watch(
  () => [props.latitud, props.longitud],
  ([nuevaLatitud, nuevaLongitud]) => {
    if (!mapa) return
    if (Number.isFinite(Number(nuevaLatitud)) && Number.isFinite(Number(nuevaLongitud))) {
      actualizarMarcador(Number(nuevaLatitud), Number(nuevaLongitud))
    }
  }
)

onMounted(async () => {
  await nextTick()
  inicializarMapa()
})

onBeforeUnmount(() => {
  if (mapa) {
    mapa.off()
    mapa.remove()
    mapa = null
    marcador = null
  }
})
</script>
