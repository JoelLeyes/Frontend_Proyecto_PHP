<template>
  <div class="video-sala">

    <!-- Cargando token -->
    <div v-if="estado === 'cargando'" class="video-sala__estado">
      <div class="cargando">Conectando a la sala...</div>
    </div>

    <!-- Error -->
    <div v-else-if="estado === 'error'" class="video-sala__estado">
      <div class="estado-vacio">
        <div class="estado-vacio__icono">📵</div>
        <p>{{ mensajeError }}</p>
        <button class="boton-secundario" @click="enrutador.back()">Volver</button>
      </div>
    </div>

    <!-- Sala activa -->
    <template v-else-if="estado === 'conectado'">

      <!-- Barra superior -->
      <div class="video-sala__barra">
        <span class="video-sala__titulo">{{ nombreSala }}</span>
        <div class="video-sala__controles">
          <button :class="['video-btn', !micActivo && 'video-btn--apagado']" @click="toggleMic" :title="micActivo ? 'Silenciar' : 'Activar micrófono'">
            {{ micActivo ? '🎤' : '🔇' }}
          </button>
          <button :class="['video-btn', !camActiva && 'video-btn--apagado']" @click="toggleCam" :title="camActiva ? 'Apagar cámara' : 'Encender cámara'">
            {{ camActiva ? '📷' : '🚫' }}
          </button>
          <button class="video-btn video-btn--peligro" @click="salirSala" title="Finalizar llamada">
            📞 Salir
          </button>
        </div>
      </div>

      <!-- Videos -->
      <div class="video-sala__grilla">
        <!-- Video propio -->
        <div class="video-sala__participante video-sala__participante--local">
          <video ref="videoLocal" autoplay muted playsinline class="video-sala__video"></video>
          <span class="video-sala__nombre">Vos</span>
        </div>

        <!-- Videos remotos -->
        <div
          v-for="participante in participantesRemotos"
          :key="participante.identity"
          class="video-sala__participante"
        >
          <video :ref="el => asignarVideoRemoto(el, participante)" autoplay playsinline class="video-sala__video"></video>
          <span class="video-sala__nombre">{{ participante.name || participante.identity }}</span>
        </div>

        <!-- Esperando al otro participante -->
        <div v-if="participantesRemotos.length === 0" class="video-sala__participante video-sala__participante--espera">
          <div class="video-sala__espera-icono">⏳</div>
          <span class="video-sala__nombre">Esperando al otro participante...</span>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Room, RoomEvent, Track } from 'livekit-client'
import axios from 'axios'

const route     = useRoute()
const enrutador = useRouter()

const reservaId  = route.params.id
const estado     = ref('cargando')
const mensajeError = ref('')
const nombreSala = ref('')

const micActivo  = ref(true)
const camActiva  = ref(true)
const videoLocal = ref(null)

const participantesRemotos = ref([])
const videoRefs = {}

let sala = null

// ── Conexión ──────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/reservas/${reservaId}/video-token`)
    nombreSala.value = data.sala

    sala = new Room()

    sala.on(RoomEvent.ParticipantConnected, () => actualizarParticipantes())
    sala.on(RoomEvent.ParticipantDisconnected, () => actualizarParticipantes())
    sala.on(RoomEvent.TrackSubscribed, (track, _pub, participante) => {
      actualizarParticipantes()
      if (track.kind === Track.Kind.Video) {
        nextTick(() => asignarVideoRemoto(videoRefs[participante.identity], participante))
      } else if (track.kind === Track.Kind.Audio) {
        track.attach()
      }
    })
    sala.on(RoomEvent.TrackUnsubscribed, () => actualizarParticipantes())

    // Track local publicado después del connect
    sala.on(RoomEvent.LocalTrackPublished, async (pub) => {
      if (pub.kind === Track.Kind.Video && pub.track) {
        await nextTick()
        if (videoLocal.value) pub.track.attach(videoLocal.value)
      }
    })

    await sala.connect(data.ws_url, data.token, {
      audio: true,
      video: true,
    })

    // Mostrar UI primero para que el <video> exista en el DOM
    actualizarParticipantes()
    estado.value = 'conectado'
    await nextTick()

    // Ahora sí adjuntar video local (puede que ya esté publicado)
    for (const [, pub] of sala.localParticipant.videoTrackPublications) {
      if (pub.track && videoLocal.value) {
        pub.track.attach(videoLocal.value)
      }
    }

  } catch (e) {
    mensajeError.value = e.response?.data?.error || 'No se pudo conectar a la videollamada.'
    estado.value = 'error'
  }
})

onBeforeUnmount(() => {
  sala?.disconnect()
})

// ── Participantes remotos ──────────────────────────────────────────────────────

function actualizarParticipantes() {
  if (!sala) return
  participantesRemotos.value = Array.from(sala.remoteParticipants.values())
}

function asignarVideoRemoto(el, participante) {
  if (!el || !participante) return
  videoRefs[participante.identity] = el

  for (const [, pub] of participante.videoTrackPublications) {
    if (pub.track && pub.isSubscribed) {
      pub.track.attach(el)
    }
  }
}

// ── Controles ─────────────────────────────────────────────────────────────────

async function toggleMic() {
  await sala.localParticipant.setMicrophoneEnabled(!micActivo.value)
  micActivo.value = !micActivo.value
}

async function toggleCam() {
  await sala.localParticipant.setCameraEnabled(!camActiva.value)
  camActiva.value = !camActiva.value
}

async function salirSala() {
  await sala?.disconnect()
  enrutador.push({ name: 'mis-reservas' })
}
</script>
