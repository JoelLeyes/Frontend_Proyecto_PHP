<template>
  <div>
    <nav class="nav-publica">
      <RouterLink :to="{ name: 'inicio' }" class="nav-publica__logo">🗓 ServiPro</RouterLink>
      <div class="nav-publica__enlaces">
        <RouterLink class="nav-link-secundario" :to="{ name: 'profesionales' }">Profesionales</RouterLink>
        <template v-if="auth.estaLogueado">
          <RouterLink class="nav-link-secundario" :to="{ name: 'panel' }">Mi cuenta</RouterLink>
          <button class="boton-secundario" @click="salir">Salir</button>
        </template>
        <template v-else>
          <RouterLink class="nav-link-secundario" :to="{ name: 'iniciar-sesion' }">Ingresar</RouterLink>
          <RouterLink :to="{ name: 'registrarse' }" class="boton-principal">Comenzar gratis</RouterLink>
        </template>
      </div>
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
