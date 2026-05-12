<template>
  <div class="layout-panel-wrapper">

    <NavBar />

    <div class="layout-panel">
      <aside class="layout-panel__lateral">
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
        <div class="layout-panel__pie">{{ auth.usuario?.name }}</div>
      </aside>

      <main class="layout-panel__contenido">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>

<style scoped>
.layout-panel-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout-panel {
  flex: 1;
  display: flex;
}
</style>
