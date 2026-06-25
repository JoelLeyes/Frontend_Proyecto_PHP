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
      <div class="campo">
        <label>Contraseña</label>
        <div class="campo-contrasena">
          <input v-model="formulario.password" :type="verContrasena ? 'text' : 'password'" placeholder="Mínimo 8 caracteres" required />
          <button type="button" class="campo-contrasena__ojo" @click="verContrasena = !verContrasena" :aria-label="verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            {{ verContrasena ? '🙈' : '👁️' }}
          </button>
        </div>
        <ul v-if="formulario.password" class="requisitos-contrasena"> // Lista de requisitos de la contraseña
          <li :class="['requisito', requisitos.longitud  ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.longitud  ? '✅' : '❌' }} Mínimo 8 caracteres</li>
          <li :class="['requisito', requisitos.mayuscula ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.mayuscula ? '✅' : '❌' }} Al menos una mayúscula</li>
          <li :class="['requisito', requisitos.minuscula ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.minuscula ? '✅' : '❌' }} Al menos una minúscula</li>
          <li :class="['requisito', requisitos.numero    ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.numero    ? '✅' : '❌' }} Al menos un número</li>
          <li :class="['requisito', requisitos.simbolo   ? 'requisito--ok' : 'requisito--pendiente']">{{ requisitos.simbolo   ? '✅' : '❌' }} Al menos un carácter especial (!@#$%&*)</li>
        </ul>
      </div>
      <div class="campo">
        <label>Confirmar contraseña</label>
        <div class="campo-contrasena">
          <input v-model="formulario.password_confirmation" :type="verConfirmacion ? 'text' : 'password'" placeholder="Repetí la contraseña" required />
          <button type="button" class="campo-contrasena__ojo" @click="verConfirmacion = !verConfirmacion" :aria-label="verConfirmacion ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            {{ verConfirmacion ? '🙈' : '👁️' }}
          </button>
        </div>
        <p v-if="formulario.password_confirmation && !requisitos.coinciden" class="campo-contrasena__no-coincide">❌ Las contraseñas no coinciden</p>
        <p v-if="formulario.password_confirmation &&  requisitos.coinciden" class="campo-contrasena__coincide">✅ Las contraseñas coinciden</p>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth      = useAuthStore()
const enrutador = useRouter()

const formulario = ref({
  name: '', email: '', password: '', password_confirmation: '', rol: 'cliente',
})
const error          = ref('')
const cargando       = ref(false)
const verContrasena  = ref(false)
const verConfirmacion = ref(false)

const requisitos = computed(() => { // Computed property que verifica los requisitos de la contraseña
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

async function manejarRegistro() { // Maneja el registro del usuario al enviar el formulario
  if (cargando.value) return
  error.value = ''

  if (!requisitos.value.coinciden) { // Verifica si las contraseñas coinciden antes de enviar el formulario
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  cargando.value = true
  auth.limpiarSesionLocal()
  try { // Intenta registrar al usuario con los datos del formulario
    await auth.registrar(formulario.value)
    enrutador.push({ name: 'panel' })
  } catch (e) {
    const errores = e.response?.data?.errors
    error.value   = errores
      ? Object.values(errores).flat().join(' ')
      : e.response?.data?.message
        || e.response?.data?.error
        || 'Error al registrarse.'
  } finally {
    cargando.value = false
  }
}
</script>
