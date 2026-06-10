<template>
  <div class="auth-formulario">

    <div class="auth-formulario__cabecera">
      <h2>Recuperar contraseña</h2>
      <p>Ingresá tu email y te enviamos un enlace para crear una nueva.</p>
    </div>

    <div v-if="enviado" class="alerta alerta--exito">
      Revisá tu bandeja de entrada. Si el email está registrado, llegará en breve.
    </div>

    <form v-else @submit.prevent="enviar">
      <div class="campo">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="ejemplo@correo.com" required :disabled="cargando" />
      </div>

      <p v-if="error" class="alerta alerta--error">{{ error }}</p>

      <button type="submit" class="boton-principal boton-bloque" :disabled="cargando">
        {{ cargando ? 'Enviando...' : 'Enviar enlace' }}
      </button>
    </form>

    <p class="auth-formulario__pie">
      <RouterLink :to="{ name: 'iniciar-sesion' }">Volver al inicio de sesión</RouterLink>
    </p>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email    = ref('')
const error    = ref('')
const cargando = ref(false)
const enviado  = ref(false)

async function enviar() {
  if (cargando.value) return
  error.value    = ''
  cargando.value = true
  try {
    await axios.post('/api/auth/recuperar-contrasena', { email: email.value })
    enviado.value = true
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo enviar el email. Intentá más tarde.'
  } finally {
    cargando.value = false
  }
}
</script>
