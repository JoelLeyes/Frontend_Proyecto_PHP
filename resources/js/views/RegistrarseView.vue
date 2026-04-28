<template>
  <div class="auth-formulario">

    <div class="auth-formulario__cabecera">
      <h2>Crear cuenta</h2>
      <p>Completá tus datos para comenzar</p>
    </div>

    <!-- Selector de tipo de cuenta -->
    <div class="auth-rol-selector">
      <button
        type="button"
        :class="['auth-rol-opcion', formulario.rol === 'cliente' && 'auth-rol-opcion--activo']"
        @click="formulario.rol = 'cliente'"
      >
        <span class="auth-rol-opcion__icono">👤</span>
        <strong>Soy cliente</strong>
        <small>Busco profesionales</small>
      </button>
      <button
        type="button"
        :class="['auth-rol-opcion', formulario.rol === 'profesional' && 'auth-rol-opcion--activo']"
        @click="formulario.rol = 'profesional'"
      >
        <span class="auth-rol-opcion__icono">💼</span>
        <strong>Soy profesional</strong>
        <small>Ofrezco servicios</small>
      </button>
    </div>

    <div class="auth-formulario__divider">datos personales</div>

    <form @submit.prevent="manejarRegistro">
      <div class="campo">
        <label>Nombre completo</label>
        <input v-model="formulario.name" placeholder="Tu nombre y apellido" required />
      </div>
      <div class="campo">
        <label>Email</label>
        <input v-model="formulario.email" type="email" placeholder="ejemplo@correo.com" required />
      </div>
      <div class="campo-fila">
        <div class="campo">
          <label>Contraseña</label>
          <input v-model="formulario.password" type="password" placeholder="Mínimo 8 caracteres" required />
        </div>
        <div class="campo">
          <label>Confirmar contraseña</label>
          <input v-model="formulario.password_confirmation" type="password" placeholder="Repetí la contraseña" required />
        </div>
      </div>

      <p v-if="error" class="alerta alerta--error">{{ error }}</p>

      <button type="submit" class="boton-principal boton-bloque" :disabled="cargando">
        {{ cargando ? 'Creando cuenta...' : 'Crear cuenta gratis' }}
      </button>
    </form>

    <p class="auth-formulario__pie">
      ¿Ya tenés cuenta?
      <RouterLink :to="{ name: 'iniciar-sesion' }">Ingresá aquí</RouterLink>
    </p>

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
