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

    <!-- Modal: elegir rol para cuenta nueva de Google -->
    <Teleport to="body">
      <div v-if="modalRol.abierto" class="modal-overlay">
        <div class="modal">
          <div class="modal__cabecera">
            <div>
              <h3 class="modal__titulo">¡Bienvenido!</h3>
              <p class="modal__subtitulo">¿Cómo querés usar la plataforma?</p>
            </div>
          </div>
          <div class="modal__cuerpo">
            <p style="margin-bottom:1.25rem;font-size:.9375rem;color:var(--color-texto-suave)">
              Elegí tu tipo de cuenta. Esta decisión no se puede cambiar después.
            </p>
            <div class="oauth-rol-opciones">
              <button
                :class="['oauth-rol-btn', modalRol.rolSeleccionado === 'cliente' && 'oauth-rol-btn--activo']"
                @click="modalRol.rolSeleccionado = 'cliente'"
              >
                <span class="oauth-rol-btn__icono">👤</span>
                <strong>Soy cliente</strong>
                <small>Busco profesionales y reservo turnos</small>
              </button>
              <button
                :class="['oauth-rol-btn', modalRol.rolSeleccionado === 'profesional' && 'oauth-rol-btn--activo']"
                @click="modalRol.rolSeleccionado = 'profesional'"
              >
                <span class="oauth-rol-btn__icono">💼</span>
                <strong>Soy profesional</strong>
                <small>Ofrezco servicios y gestiono mi agenda</small>
              </button>
            </div>
            <p v-if="modalRol.error" class="alerta alerta--error" style="margin-top:1rem">{{ modalRol.error }}</p>
          </div>
          <div class="modal__pie">
            <button
              class="boton-principal boton-bloque"
              :disabled="!modalRol.rolSeleccionado || modalRol.enviando"
              @click="completarRegistroOAuth"
            >
              {{ modalRol.enviando ? 'Creando cuenta...' : 'Continuar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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

const modalRol = ref({
  abierto: false,
  pendingToken: '',
  rolSeleccionado: '',
  enviando: false,
  error: '',
})

function obtenerUrlOAuth(proveedor) {
  const baseUrl = new URL(axios.defaults.baseURL || window.location.origin, window.location.origin)
  return new URL(`/api/auth/${proveedor}/redirect`, baseUrl).toString()
}

function iniciarOAuth(proveedor) {
  window.location.href = obtenerUrlOAuth(proveedor)
}

onMounted(async () => {
  const tokenOAuth   = ruta.query.oauth_token?.toString()
  const errorOAuth   = ruta.query.oauth_error?.toString()
  const pendingToken = ruta.query.oauth_pending?.toString()

  if (errorOAuth) {
    error.value = errorOAuth
    return
  }

  // Usuario nuevo con Google: pedir que elija rol
  if (pendingToken) {
    modalRol.value = { abierto: true, pendingToken, rolSeleccionado: '', enviando: false, error: '' }
    return
  }

  if (!tokenOAuth) return

  // Usuario existente con Google: completar sesión directamente
  cargando.value = true
  try {
    await auth.completarSesionOAuth(tokenOAuth)
    enrutador.push({ name: 'panel' })
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo completar el inicio de sesión social.'
  } finally {
    cargando.value = false
  }
})

async function completarRegistroOAuth() {
  modalRol.value.error    = ''
  modalRol.value.enviando = true
  try {
    const { data } = await axios.post('/api/auth/oauth/completar', {
      pending_token: modalRol.value.pendingToken,
      rol:           modalRol.value.rolSeleccionado,
    })
    await auth.completarSesionOAuth(data.token)
    enrutador.push({ name: 'panel' })
  } catch (e) {
    modalRol.value.error = e.response?.data?.error || 'No se pudo crear la cuenta. Intentá nuevamente.'
  } finally {
    modalRol.value.enviando = false
  }
}

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
