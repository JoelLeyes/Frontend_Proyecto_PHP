<template>
  <div class="contenedor-auth">
    <h1>Iniciar sesión</h1>
    <form @submit.prevent="manejarInicioSesion">
      <div>
        <label>Email</label>
        <input v-model="formulario.email" type="email" required />
      </div>
      <div>
        <label>Contraseña</label>
        <input v-model="formulario.password" type="password" required />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>
    <RouterLink :to="{ name: 'registrarse' }">¿No tenés cuenta? Registrate</RouterLink>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth      = useAuthStore()
const enrutador = useRouter()

const formulario = ref({ email: '', password: '' })
const error      = ref('')
const cargando   = ref(false)

async function manejarInicioSesion() {
  error.value    = ''
  cargando.value = true
  try {
    await auth.iniciarSesion(formulario.value.email, formulario.value.password)
    enrutador.push({ name: 'panel' })
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al iniciar sesión.'
  } finally {
    cargando.value = false
  }
}
</script>
