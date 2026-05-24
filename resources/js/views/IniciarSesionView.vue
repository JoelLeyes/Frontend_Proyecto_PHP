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
      <button
        type="button"
        class="boton-secundario boton-bloque auth-social__boton auth-social__boton--github"
        :disabled="cargando"
        @click="iniciarOAuth('github')"
      >
        Continuar con GitHub
      </button>
      <button
        type="button"
        class="boton-secundario boton-bloque auth-social__boton auth-social__boton--facebook"
        :disabled="cargando"
        @click="iniciarOAuth('facebook')"
      >
        Continuar con Facebook
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
  const callbackUrl = new URL(`/api/auth/${proveedor}/callback`, baseUrl).toString()

  if (proveedor === 'google' && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', import.meta.env.VITE_GOOGLE_CLIENT_ID)
    url.searchParams.set('redirect_uri', callbackUrl)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid email profile')
    url.searchParams.set('prompt', 'select_account')
    return url.toString()
  }

  if (proveedor === 'github' && import.meta.env.VITE_GITHUB_CLIENT_ID) {
    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.set('client_id', import.meta.env.VITE_GITHUB_CLIENT_ID)
    url.searchParams.set('redirect_uri', callbackUrl)
    url.searchParams.set('scope', 'read:user user:email')
    return url.toString()
  }

  if (proveedor === 'facebook' && import.meta.env.VITE_FACEBOOK_CLIENT_ID) {
    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth')
    url.searchParams.set('client_id', import.meta.env.VITE_FACEBOOK_CLIENT_ID)
    url.searchParams.set('redirect_uri', callbackUrl)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'email,public_profile')
    return url.toString()
  }

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
