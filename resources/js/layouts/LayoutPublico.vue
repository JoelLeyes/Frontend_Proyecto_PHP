<template>
  <div>
    <nav>
      <RouterLink :to="{ name: 'inicio' }">Inicio</RouterLink>
      <RouterLink :to="{ name: 'profesionales' }">Profesionales</RouterLink>
      <template v-if="auth.estaLogueado">
        <RouterLink :to="{ name: 'panel' }">Mi cuenta</RouterLink>
        <button @click="salir">Salir</button>
      </template>
      <template v-else>
        <RouterLink :to="{ name: 'iniciar-sesion' }">Ingresar</RouterLink>
        <RouterLink :to="{ name: 'registrarse' }">Registrarse</RouterLink>
      </template>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth      = useAuthStore()
const enrutador = useRouter()

async function salir() {
  await auth.cerrarSesion()
  enrutador.push({ name: 'inicio' })
}
</script>
