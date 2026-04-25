<template>
  <div class="contenedor-auth">
    <h1>Crear cuenta</h1>
    <form @submit.prevent="manejarRegistro">
      <div>
        <label>Nombre completo</label>
        <input v-model="formulario.name" required />
      </div>
      <div>
        <label>Email</label>
        <input v-model="formulario.email" type="email" required />
      </div>
      <div>
        <label>Contraseña</label>
        <input v-model="formulario.password" type="password" required />
      </div>
      <div>
        <label>Confirmar contraseña</label>
        <input v-model="formulario.password_confirmation" type="password" required />
      </div>
      <div>
        <label>Tipo de cuenta</label>
        <select v-model="formulario.rol">
          <option value="cliente">Cliente</option>
          <option value="profesional">Profesional</option>
        </select>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>
    <RouterLink :to="{ name: 'iniciar-sesion' }">¿Ya tenés cuenta? Ingresá</RouterLink>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth      = useAuthStore()
const enrutador = useRouter()

const formulario = ref({
  name: '', email: '', password: '', password_confirmation: '', rol: 'cliente',
})
const error    = ref('')
const cargando = ref(false)

async function manejarRegistro() {
  error.value    = ''
  cargando.value = true
  try {
    await auth.registrar(formulario.value)
    enrutador.push({ name: 'panel' })
  } catch (e) {
    const errores = e.response?.data?.errors
    error.value   = errores
      ? Object.values(errores).flat().join(' ')
      : e.response?.data?.error || 'Error al registrarse.'
  } finally {
    cargando.value = false
  }
}
</script>
