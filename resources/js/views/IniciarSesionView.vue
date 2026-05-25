<template>
  <div class="auth-formulario">

    <div class="auth-formulario__cabecera">
      <h2>Bienvenido de vuelta</h2>
      <p>Ingresá con tu cuenta para continuar</p>
    </div>

    <div class="auth-social">
      <button
        type="button"
        class="boton-secundario boton-bloque auth-social__boton auth-social__boton--google"
        :disabled="cargando"
        @click="iniciarOAuth('google')"
      >
        Continuar con Google
      </button>
    </div>

    <div class="auth-formulario__divider">o con tu email</div>

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
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth      = useAuthStore()
const enrutador = useRouter()
const ruta      = useRoute()

const formulario = ref({ email: '', password: '' })
const error      = ref('')
const cargando   = ref(false)

function obtenerUrlOAuth(proveedor) {
  const baseUrl = new URL(axios.defaults.baseURL || window.location.origin, window.location.origin)

  return new URL(`/api/auth/${proveedor}/redirect`, baseUrl).toString()
}

function iniciarOAuth(proveedor) {
  window.location.href = obtenerUrlOAuth(proveedor)
}

onMounted(async () => {
  const tokenOAuth = ruta.query.oauth_token?.toString()
  const errorOAuth = ruta.query.oauth_error?.toString()

  if (errorOAuth) {
    error.value = errorOAuth
  }

  if (!tokenOAuth) {
    return
  }

  cargando.value = true
  error.value = ''

  try {
    await auth.completarSesionOAuth(tokenOAuth)
    enrutador.push({ name: 'panel' })
  } catch (e) {
    error.value = e.response?.data?.error || errorOAuth || 'No se pudo completar el inicio de sesión social.'
  } finally {
    cargando.value = false
  }
})

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
