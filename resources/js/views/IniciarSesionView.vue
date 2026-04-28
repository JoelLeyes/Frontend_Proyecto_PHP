<template>
  <div class="auth-formulario">

    <div class="auth-formulario__cabecera">
      <h2>Bienvenido de vuelta</h2>
      <p>Ingresá con tu cuenta para continuar</p>
    </div>

    <form @submit.prevent="manejarInicioSesion">
      <div class="campo">
        <label>Email</label>
        <input v-model="formulario.email" type="email" placeholder="ejemplo@correo.com" required />
      </div>
      <div class="campo">
        <label>Contraseña</label>
        <input v-model="formulario.password" type="password" placeholder="Tu contraseña" required />
      </div>

      <p v-if="error" class="alerta alerta--error">{{ error }}</p>

      <button type="submit" class="boton-principal boton-bloque" :disabled="cargando">
        {{ cargando ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>

    <p class="auth-formulario__pie">
      ¿No tenés cuenta?
      <RouterLink :to="{ name: 'registrarse' }">Registrate gratis</RouterLink>
    </p>

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
    error.value = e.response?.data?.error || 'Email o contraseña incorrectos.'
  } finally {
    cargando.value = false
  }
}
</script>
