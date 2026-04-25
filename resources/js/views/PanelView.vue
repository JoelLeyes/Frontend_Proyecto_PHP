<template>
  <div>
    <h1>Bienvenido, {{ auth.usuario?.name }}</h1>

    <div class="accesos-rapidos">
      <RouterLink v-if="auth.usuario?.rol === 'cliente'" :to="{ name: 'profesionales' }" class="tarjeta">
        Buscar profesionales
      </RouterLink>
      <RouterLink :to="{ name: 'mis-reservas' }" class="tarjeta">
        Mis reservas
      </RouterLink>
      <RouterLink v-if="auth.usuario?.rol === 'profesional'" :to="{ name: 'mis-servicios' }" class="tarjeta">
        Mis servicios
      </RouterLink>
      <RouterLink v-if="auth.usuario?.rol === 'profesional'" :to="{ name: 'mi-disponibilidad' }" class="tarjeta">
        Mi disponibilidad
      </RouterLink>
      <RouterLink v-if="auth.usuario?.rol === 'admin'" :to="{ name: 'panel-admin' }" class="tarjeta">
        Administración
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>
