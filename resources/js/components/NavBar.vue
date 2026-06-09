<template>
  <header class="navbar">
    <div class="navbar__izquierda">
      <RouterLink :to="{ name: 'inicio' }" class="navbar__logo">🗓 ServiPro</RouterLink>
      <RouterLink class="navbar__link" :to="{ name: 'profesionales' }">Profesionales</RouterLink>
    </div>

    <div class="navbar__derecha">
      <!-- No logueado -->
      <template v-if="!auth.estaLogueado">
        <RouterLink class="navbar__link" :to="{ name: 'iniciar-sesion' }">Ingresar</RouterLink>
        <RouterLink :to="{ name: 'registrarse' }" class="boton-principal navbar__boton">Comenzar gratis</RouterLink>
      </template>

      <!-- Logueado -->
      <template v-else>
        <RouterLink class="navbar__link navbar__link--panel" :to="{ name: 'panel' }">Mi panel</RouterLink>

        <!-- Campana de notificaciones -->
        <div class="navbar__campana-wrapper" ref="campanaRef">
          <button class="navbar__campana" @click="toggleCampana" :aria-label="`${notifStore.noLeidas} notificaciones sin leer`">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span v-if="notifStore.noLeidas > 0" class="navbar__campana-badge">
              {{ notifStore.noLeidas > 9 ? '9+' : notifStore.noLeidas }}
            </span>
          </button>

          <!-- Dropdown de notificaciones -->
          <div v-if="campanaAbierta" class="navbar__notif-dropdown">
            <div class="navbar__notif-cabecera">
              <span class="navbar__notif-titulo">Notificaciones</span>
              <button v-if="notifStore.historial.length" class="navbar__notif-leer-todo" @click="notifStore.marcarTodasLeidas()">
                Marcar todo leído
              </button>
            </div>

            <div v-if="!notifStore.historial.length" class="navbar__notif-vacia">
              Sin notificaciones nuevas
            </div>

            <ul v-else class="navbar__notif-lista">
              <li
                v-for="notif in notifStore.historial"
                :key="notif.id"
                :class="['navbar__notif-item', !notif.leida && 'navbar__notif-item--nueva']"
              >
                <span class="navbar__notif-icono">{{ notif.icono }}</span>
                <div class="navbar__notif-cuerpo">
                  <p class="navbar__notif-texto">{{ notif.texto }}</p>
                  <time class="navbar__notif-tiempo">{{ tiempoRelativo(notif.tiempo) }}</time>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Perfil desplegable -->
        <div class="navbar__perfil" ref="perfilRef" @click="menuAbierto = !menuAbierto">
          <div class="navbar__avatar">
            <img v-if="auth.usuario?.avatar" :src="auth.usuario.avatar" :alt="auth.usuario.name" />
            <span v-else>{{ iniciales }}</span>
          </div>
          <div class="navbar__perfil-info">
            <span class="navbar__nombre">{{ auth.usuario?.name }}</span>
            <span :class="['navbar__rol', 'navbar__rol--' + auth.usuario?.rol]">{{ etiquetaRol }}</span>
          </div>
          <span class="navbar__chevron" :class="{ 'navbar__chevron--abierto': menuAbierto }">▾</span>

          <!-- Menú dropdown -->
          <div v-if="menuAbierto" class="navbar__dropdown">
            <RouterLink class="navbar__dropdown-item navbar__dropdown-item--solo-movil" :to="{ name: 'profesionales' }" @click="menuAbierto = false">
              🔍 Profesionales
            </RouterLink>
            <RouterLink class="navbar__dropdown-item" :to="{ name: 'mi-perfil' }" @click="menuAbierto = false">
              👤 Mi perfil
            </RouterLink>
            <RouterLink class="navbar__dropdown-item" :to="{ name: 'mis-reservas' }" @click="menuAbierto = false">
              📅 Mis reservas
            </RouterLink>
            <RouterLink v-if="auth.usuario?.rol === 'cliente'" class="navbar__dropdown-item" :to="{ name: 'mis-paquetes' }" @click="menuAbierto = false">
              📦 Mis paquetes
            </RouterLink>
            <template v-if="auth.usuario?.rol === 'profesional'">
              <RouterLink class="navbar__dropdown-item" :to="{ name: 'mis-servicios' }" @click="menuAbierto = false">
                💼 Mis servicios
              </RouterLink>
              <RouterLink class="navbar__dropdown-item" :to="{ name: 'mi-disponibilidad' }" @click="menuAbierto = false">
                🕐 Disponibilidad
              </RouterLink>
              <RouterLink class="navbar__dropdown-item" :to="{ name: 'mis-resenas' }" @click="menuAbierto = false">
                ⭐ Mis reseñas
              </RouterLink>
              <RouterLink class="navbar__dropdown-item" :to="{ name: 'mis-cobros' }" @click="menuAbierto = false">
                💳 Mis cobros
              </RouterLink>
            </template>
            <RouterLink v-if="auth.usuario?.rol === 'admin'" class="navbar__dropdown-item" :to="{ name: 'panel-admin' }" @click="menuAbierto = false">
              ⚙️ Administración
            </RouterLink>
            <div class="navbar__dropdown-separador"></div>
            <button class="navbar__dropdown-item navbar__dropdown-item--salir" @click="salir">
              🚪 Cerrar sesión
            </button>
          </div>
        </div>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notificationStore'
import { useRouter } from 'vue-router'

const auth        = useAuthStore()
const notifStore  = useNotificationStore()
const enrutador   = useRouter()
const menuAbierto  = ref(false)
const campanaAbierta = ref(false)
const perfilRef    = ref(null)
const campanaRef   = ref(null)

const iniciales = computed(() => {
    const nombre = auth.usuario?.name || ''
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

const etiquetaRol = computed(() => {
    const mapa = { cliente: 'Cliente', profesional: 'Profesional', admin: 'Admin' }
    return mapa[auth.usuario?.rol] || auth.usuario?.rol
})

function toggleCampana() {
    campanaAbierta.value = !campanaAbierta.value
    if (campanaAbierta.value) {
        menuAbierto.value = false
        notifStore.marcarTodasLeidas()
        notifStore.marcarLeidasEnApi()
    }
}

function tiempoRelativo(tiempo) {
    const diff = Date.now() - new Date(tiempo).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'Ahora'
    if (mins < 60) return `Hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `Hace ${hrs} h`
    return `Hace ${Math.floor(hrs / 24)} días`
}

async function salir() {
    menuAbierto.value = false
    campanaAbierta.value = false
    await auth.cerrarSesion()
    enrutador.push({ name: 'inicio' })
}

function cerrarAlClickAfuera(e) {
    if (perfilRef.value && !perfilRef.value.contains(e.target)) {
        menuAbierto.value = false
    }
    if (campanaRef.value && !campanaRef.value.contains(e.target)) {
        campanaAbierta.value = false
    }
}

onMounted(() => document.addEventListener('click', cerrarAlClickAfuera))
onBeforeUnmount(() => document.removeEventListener('click', cerrarAlClickAfuera))
</script>
