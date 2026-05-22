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
import { useRouter } from 'vue-router'

const auth      = useAuthStore()
const enrutador = useRouter()
const menuAbierto = ref(false)
const perfilRef   = ref(null)

const iniciales = computed(() => {
  const nombre = auth.usuario?.name || ''
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

const etiquetaRol = computed(() => {
  const mapa = { cliente: 'Cliente', profesional: 'Profesional', admin: 'Admin' }
  return mapa[auth.usuario?.rol] || auth.usuario?.rol
})

async function salir() {
  menuAbierto.value = false
  await auth.cerrarSesion()
  enrutador.push({ name: 'inicio' })
}

function cerrarAlClickAfuera(e) {
  if (perfilRef.value && !perfilRef.value.contains(e.target)) {
    menuAbierto.value = false
  }
}

onMounted(() => document.addEventListener('click', cerrarAlClickAfuera))
onBeforeUnmount(() => document.removeEventListener('click', cerrarAlClickAfuera))
</script>
