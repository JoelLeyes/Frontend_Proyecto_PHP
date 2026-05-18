<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Mi Perfil</h1>
    </div>

    <div class="perfil-layout">

      <!-- Tarjeta identidad -->
      <div class="tarjeta perfil-identidad">
        <!-- Avatar -->
        <div class="perfil-avatar-wrap" @click="$refs.inputAvatar.click()">
          <img v-if="previstaAvatar || auth.usuario?.avatar"
               :src="previstaAvatar || auth.usuario.avatar"
               class="perfil-avatar-img" alt="Avatar" />
          <div v-else class="perfil-avatar">{{ iniciales }}</div>
          <div class="perfil-avatar-overlay">📷 Cambiar foto</div>
        </div>
        <input ref="inputAvatar" type="file" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none" @change="onArchivoElegido" />

        <p v-if="errorAvatar" class="perfil-avatar-error">{{ errorAvatar }}</p>
        <p v-else-if="previstaAvatar" class="perfil-avatar-lista">✓ Lista — guardá los cambios</p>

        <h2 class="perfil-identidad__nombre">{{ auth.usuario?.name }}</h2>
        <p class="perfil-identidad__email">{{ auth.usuario?.email }}</p>
        <span class="insignia" :class="insigniaRol">{{ etiquetaRol }}</span>
      </div>

      <!-- Formularios -->
      <div style="display:flex;flex-direction:column;gap:1.25rem">

        <p v-if="mensajeExito" class="alerta alerta--exito">{{ mensajeExito }}</p>
        <p v-if="mensajeError"  class="alerta alerta--error">{{ mensajeError }}</p>

        <!-- Datos personales -->
        <div class="tarjeta">
          <h3 class="perfil-seccion-titulo">Datos personales</h3>
          <form @submit.prevent="guardar">
            <div class="campo">
              <label>Nombre completo</label>
              <input v-model="formulario.name" required placeholder="Tu nombre completo" />
            </div>
            <div class="campo">
              <label>Teléfono</label>
              <input v-model="formulario.telefono" type="tel"
                pattern="[+]?[0-9\s\-()+]{6,20}"
                placeholder="Ej: +598 99 123 456"
                title="Solo números, espacios, guiones y paréntesis. Ej: +598 99 123 456" />
            </div>
            <div class="campo">
              <label>Email</label>
              <input :value="auth.usuario?.email" disabled class="campo-deshabilitado" />
              <small class="campo-ayuda">El email no puede modificarse.</small>
            </div>
            <div class="campo">
              <label>Rol</label>
              <input :value="etiquetaRol" disabled class="campo-deshabilitado" />
              <small class="campo-ayuda">El rol es asignado por el sistema.</small>
            </div>
            <div style="display:flex;justify-content:flex-end;margin-top:.5rem">
              <button type="submit" class="boton-principal" :disabled="guardando">
                {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Preferencias de notificación -->
        <div class="tarjeta">
          <h3 class="perfil-seccion-titulo">Preferencias de notificación</h3>
          <div class="notif-fila">
            <div>
              <p class="notif-fila__titulo">Notificaciones por email</p>
              <p class="notif-fila__desc">Recibís confirmaciones de reserva, recordatorios y cambios de estado por email.</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="formulario.notificaciones_email" @change="guardar" />
              <span class="toggle__slider"></span>
            </label>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const auth = useAuthStore()

const formulario   = ref({ name: '', telefono: '', notificaciones_email: true })
const archivoAvatar  = ref(null)
const previstaAvatar = ref(null)
const errorAvatar    = ref('')
const guardando      = ref(false)
const mensajeExito   = ref('')
const mensajeError   = ref('')

const iniciales = computed(() => {
  const nombre = auth.usuario?.name || ''
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

const etiquetaRol = computed(() => {
  const mapa = { cliente: 'Cliente', profesional: 'Profesional', admin: 'Administrador' }
  return mapa[auth.usuario?.rol] || auth.usuario?.rol
})

const insigniaRol = computed(() => {
  const mapa = { cliente: 'insignia--confirmada', profesional: 'insignia--pagada', admin: 'insignia--en-curso' }
  return mapa[auth.usuario?.rol] || ''
})

onMounted(() => {
  formulario.value.name                 = auth.usuario?.name || ''
  formulario.value.telefono             = auth.usuario?.telefono || ''
  formulario.value.notificaciones_email = auth.usuario?.notificaciones_email ?? true
})

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

function onArchivoElegido(evento) {
  errorAvatar.value = ''
  const archivo = evento.target.files[0]
  if (!archivo) return

  if (!TIPOS_IMAGEN.includes(archivo.type)) {
    errorAvatar.value = 'El archivo debe ser JPG, PNG, GIF o WebP.'
    evento.target.value = ''
    return
  }

  if (archivo.size > MAX_AVATAR_BYTES) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1)
    errorAvatar.value = `La imagen pesa ${mb} MB. El máximo es 2 MB.`
    evento.target.value = ''
    return
  }

  archivoAvatar.value  = archivo
  previstaAvatar.value = URL.createObjectURL(archivo)
}

async function guardar() {
  mensajeExito.value = ''
  mensajeError.value = ''
  guardando.value    = true

  try {
    let datos

    if (archivoAvatar.value) {
      datos = new FormData()
      datos.append('name',                 formulario.value.name)
      datos.append('telefono',             formulario.value.telefono || '')
      datos.append('notificaciones_email', formulario.value.notificaciones_email ? '1' : '0')
      datos.append('avatar',               archivoAvatar.value)
      datos.append('_method',              'PUT')

      const { data } = await axios.post('/api/auth/perfil', datos, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      actualizarStore(data.usuario)
      archivoAvatar.value  = null
      previstaAvatar.value = null
      errorAvatar.value    = ''
    } else {
      const { data } = await axios.put('/api/auth/perfil', formulario.value)
      actualizarStore(data.usuario)
    }

    mensajeExito.value = 'Perfil actualizado correctamente.'
    setTimeout(() => { mensajeExito.value = '' }, 3000)
  } catch (e) {
    mensajeError.value = e.response?.data?.message || 'Error al guardar los cambios.'
  } finally {
    guardando.value = false
  }
}

function actualizarStore(usuario) {
  auth.usuario.name                 = usuario.name
  auth.usuario.telefono             = usuario.telefono
  auth.usuario.avatar               = usuario.avatar
  auth.usuario.notificaciones_email = usuario.notificaciones_email
  localStorage.setItem('usuario', JSON.stringify(auth.usuario))
}

</script>

