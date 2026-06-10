<template>
  <div class="auth-formulario">

    <div class="auth-formulario__cabecera">
      <h2>Nueva contraseña</h2>
      <p>Elegí una contraseña segura para tu cuenta.</p>
    </div>

    <div v-if="!tokenValido" class="alerta alerta--error">
      El enlace no es válido o expiró.
      <RouterLink :to="{ name: 'recuperar-contrasena' }"> Solicitá uno nuevo.</RouterLink>
    </div>

    <div v-else-if="exito" class="alerta alerta--exito">
      Contraseña actualizada. Ya podés
      <RouterLink :to="{ name: 'iniciar-sesion' }">iniciar sesión</RouterLink>.
    </div>

    <form v-else @submit.prevent="restablecer">
      <div class="campo">
        <label>Nueva contraseña</label>
        <div class="campo-contrasena">
          <input
            v-model="formulario.password"
            :type="verPassword ? 'text' : 'password'"
            placeholder="Mínimo 8 caracteres"
            required
            :disabled="cargando"
          />
          <button type="button" class="campo-contrasena__ojo" @click="verPassword = !verPassword">
            {{ verPassword ? '🙈' : '👁' }}
          </button>
        </div>
        <div class="requisitos-contrasena">
          <span :class="['requisito', requisitos.longitud ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.longitud ? '✅' : '❌' }} 8 caracteres mínimo</span>
          <span :class="['requisito', requisitos.mayuscula ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.mayuscula ? '✅' : '❌' }} Una mayúscula</span>
          <span :class="['requisito', requisitos.minuscula ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.minuscula ? '✅' : '❌' }} Una minúscula</span>
          <span :class="['requisito', requisitos.numero ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.numero ? '✅' : '❌' }} Un número</span>
          <span :class="['requisito', requisitos.simbolo ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.simbolo ? '✅' : '❌' }} Un símbolo (!@#...)</span>
        </div>
      </div>

      <div class="campo">
        <label>Confirmar contraseña</label>
        <div class="campo-contrasena">
          <input
            v-model="formulario.password_confirmation"
            :type="verConfirmacion ? 'text' : 'password'"
            placeholder="Repetí la contraseña"
            required
            :disabled="cargando"
          />
          <button type="button" class="campo-contrasena__ojo" @click="verConfirmacion = !verConfirmacion">
            {{ verConfirmacion ? '🙈' : '👁' }}
          </button>
        </div>
        <span v-if="formulario.password_confirmation.length > 0" :class="requisitos.coinciden ? 'campo-contrasena__coincide' : 'campo-contrasena__no-coincide'">
          {{ requisitos.coinciden ? '✅ Las contraseñas coinciden' : '❌ Las contraseñas no coinciden' }}
        </span>
      </div>

      <p v-if="error" class="alerta alerta--error">{{ error }}</p>

      <button type="submit" class="boton-principal boton-bloque" :disabled="cargando || !formularioValido">
        {{ cargando ? 'Guardando...' : 'Guardar contraseña' }}
      </button>
    </form>

  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const ruta = useRoute()

const formulario = ref({ password: '', password_confirmation: '' })
const error          = ref('')
const cargando       = ref(false)
const exito          = ref(false)
const tokenValido    = ref(true)
const verPassword    = ref(false)
const verConfirmacion = ref(false)

let token = ''
let email = ''

onMounted(() => {
  token = ruta.query.token?.toString() || ''
  email = ruta.query.email?.toString() || ''
  if (!token || !email) tokenValido.value = false
})

const requisitos = computed(() => {
  const p = formulario.value.password
  return {
    longitud:  p.length >= 8,
    mayuscula: /[A-Z]/.test(p),
    minuscula: /[a-z]/.test(p),
    numero:    /[0-9]/.test(p),
    simbolo:   /[^A-Za-z0-9]/.test(p),
    coinciden: p.length > 0 && p === formulario.value.password_confirmation,
  }
})

const formularioValido = computed(() =>
  Object.values(requisitos.value).every(Boolean)
)

async function restablecer() {
  if (cargando.value || !formularioValido.value) return
  error.value    = ''
  cargando.value = true
  try {
    await axios.post('/api/auth/restablecer-contrasena', {
      email,
      token,
      password:              formulario.value.password,
      password_confirmation: formulario.value.password_confirmation,
    })
    exito.value = true
  } catch (e) {
    error.value = e.response?.data?.error || 'No se pudo actualizar la contraseña.'
  } finally {
    cargando.value = false
  }
}
</script>
