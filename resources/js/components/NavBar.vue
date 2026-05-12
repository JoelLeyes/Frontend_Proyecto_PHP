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
        <RouterLink class="navbar__link" :to="{ name: 'panel' }">Mi panel</RouterLink>

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

<style scoped>
.navbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid var(--color-borde-suave);
  box-shadow: 0 1px 4px rgba(13,148,136,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar__izquierda,
.navbar__derecha {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.navbar__logo {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--color-primario);
  text-decoration: none;
  letter-spacing: -.01em;
}

.navbar__link {
  font-size: .9375rem;
  color: var(--color-texto-suave);
  text-decoration: none;
  transition: color .15s;
}
.navbar__link:hover { color: var(--color-primario); }

.navbar__boton { padding: .45rem 1rem; font-size: .875rem; }

/* Perfil */
.navbar__perfil {
  display: flex;
  align-items: center;
  gap: .625rem;
  cursor: pointer;
  padding: .375rem .625rem;
  border-radius: var(--radio-borde);
  position: relative;
  transition: background .15s;
  user-select: none;
}
.navbar__perfil:hover { background: var(--color-fondo); }

.navbar__avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primario), var(--color-primario-oscuro));
  color: #fff;
  font-size: .875rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--color-primario-claro);
}
.navbar__avatar img { width: 100%; height: 100%; object-fit: cover; }

.navbar__perfil-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.navbar__nombre {
  font-size: .875rem;
  font-weight: 600;
  color: var(--color-texto-medio);
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.navbar__rol {
  font-size: .6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  padding: .05rem .375rem;
  border-radius: 9999px;
  display: inline-block;
  width: fit-content;
}
.navbar__rol--cliente      { background: #dbeafe; color: #1e40af; }
.navbar__rol--profesional  { background: #d1fae5; color: #065f46; }
.navbar__rol--admin        { background: #fef3c7; color: #92400e; }

.navbar__chevron {
  font-size: .75rem;
  color: var(--color-texto-suave);
  transition: transform .2s;
}
.navbar__chevron--abierto { transform: rotate(180deg); }

/* Dropdown */
.navbar__dropdown {
  position: absolute;
  top: calc(100% + .5rem);
  right: 0;
  background: #fff;
  border: 1px solid var(--color-borde-suave);
  border-radius: var(--radio-borde);
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
  min-width: 200px;
  padding: .375rem 0;
  z-index: 200;
}
.navbar__dropdown-item {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .625rem 1rem;
  font-size: .9rem;
  color: var(--color-texto-medio);
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background .15s;
}
.navbar__dropdown-item:hover { background: var(--color-fondo); color: var(--color-primario); }
.navbar__dropdown-separador { height: 1px; background: var(--color-borde-suave); margin: .375rem 0; }
.navbar__dropdown-item--salir { color: #dc2626; }
.navbar__dropdown-item--salir:hover { background: #fee2e2; color: #b91c1c; }
</style>
