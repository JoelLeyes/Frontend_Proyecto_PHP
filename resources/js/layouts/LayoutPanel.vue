<template>
  <div class="layout-panel">

    <aside class="layout-panel__lateral">
      <div class="layout-panel__logo">
        🗓 ServiPro
      </div>
      <nav class="layout-panel__nav">
        <RouterLink :to="{ name: 'panel' }">🏠 Inicio</RouterLink>
        <RouterLink :to="{ name: 'mis-reservas' }">📅 Mis reservas</RouterLink>
        <RouterLink :to="{ name: 'mi-perfil' }">👤 Mi perfil</RouterLink>
        <template v-if="auth.usuario?.rol === 'profesional'">
          <RouterLink :to="{ name: 'mis-servicios' }">💼 Mis servicios</RouterLink>
          <RouterLink :to="{ name: 'mi-disponibilidad' }">🕐 Disponibilidad</RouterLink>
        </template>
        <RouterLink v-if="auth.usuario?.rol === 'admin'" :to="{ name: 'panel-admin' }">
          ⚙️ Administración
        </RouterLink>
      </nav>
      <div class="layout-panel__pie">
        {{ auth.usuario?.name }}
      </div>
    </aside>

    <main class="layout-panel__contenido">
      <RouterView />
    </main>

  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>
