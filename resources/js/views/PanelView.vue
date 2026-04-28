<template>
  <div>
    <!-- Saludo -->
    <div class="panel-saludo">
      <div class="panel-saludo__avatar">{{ iniciales }}</div>
      <div>
        <h1 class="panel-saludo__titulo">Bienvenido, {{ auth.usuario?.name?.split(' ')[0] }} 👋</h1>
        <p class="panel-saludo__rol">{{ etiquetaRol }}</p>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <h2 class="panel-seccion-titulo">Accesos rápidos</h2>
    <div class="accesos-rapidos">
      <RouterLink
        v-if="auth.usuario?.rol === 'cliente'"
        :to="{ name: 'profesionales' }"
        class="acceso-rapido"
      >
        <span class="acceso-rapido__icono">🔍</span>
        <span class="acceso-rapido__texto">Buscar profesionales</span>
      </RouterLink>

      <RouterLink :to="{ name: 'mis-reservas' }" class="acceso-rapido">
        <span class="acceso-rapido__icono">📅</span>
        <span class="acceso-rapido__texto">Mis reservas</span>
      </RouterLink>

      <RouterLink :to="{ name: 'mi-perfil' }" class="acceso-rapido">
        <span class="acceso-rapido__icono">👤</span>
        <span class="acceso-rapido__texto">Mi perfil</span>
      </RouterLink>

      <template v-if="auth.usuario?.rol === 'profesional'">
        <RouterLink :to="{ name: 'mis-servicios' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">💼</span>
          <span class="acceso-rapido__texto">Mis servicios</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mi-disponibilidad' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">🕐</span>
          <span class="acceso-rapido__texto">Disponibilidad</span>
        </RouterLink>
      </template>

      <RouterLink
        v-if="auth.usuario?.rol === 'admin'"
        :to="{ name: 'panel-admin' }"
        class="acceso-rapido"
      >
        <span class="acceso-rapido__icono">⚙️</span>
        <span class="acceso-rapido__texto">Administración</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const iniciales = computed(() => {
  const nombre = auth.usuario?.name || ''
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

const etiquetaRol = computed(() => {
  const mapa = { cliente: 'Cliente', profesional: 'Profesional', admin: 'Administrador' }
  return mapa[auth.usuario?.rol] || ''
})
</script>

<style scoped>
.panel-saludo {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: linear-gradient(135deg, var(--color-primario), var(--color-primario-oscuro));
  color: #fff;
  padding: 1.75rem 2rem;
  border-radius: calc(var(--radio-borde) * 1.5);
  margin-bottom: 2rem;
  box-shadow: var(--sombra-media);
}
.panel-saludo__avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  font-weight: 700;
  flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.3);
}
.panel-saludo__titulo { font-size: 1.375rem; font-weight: 700; margin-bottom: 0.125rem; }
.panel-saludo__rol    { font-size: 0.875rem; opacity: 0.85; margin: 0; }
.panel-seccion-titulo { font-size: 1rem; font-weight: 600; color: var(--color-texto-suave); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem; }
</style>
