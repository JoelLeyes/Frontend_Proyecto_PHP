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

        <!-- Ubicación profesional -->
        <div v-if="esProfesional" class="tarjeta">
          <div class="perfil-seccion-cabecera">
            <h3 class="perfil-seccion-titulo">Ubicación del encuentro</h3>
            <span class="perfil-seccion-tag">Para servicios presenciales o híbridos</span>
          </div>

          <p class="perfil-seccion-desc">
            Definí la ubicación donde atenderás al cliente. El mapa se usa para que el cliente vea el punto exacto del encuentro.
          </p>

          <div class="campo">
            <label>Modalidad del profesional</label>
            <select v-model="perfilProfesional.form.modalidad">
              <option value="presencial">Presencial</option>
              <option value="remota">Remota</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </div>

          <template v-if="perfilProfesional.form.modalidad !== 'remota'">
            <div class="campo">
              <label>Dirección</label>
              <input v-model="perfilProfesional.form.direccion" placeholder="Ej: Av. 18 de Julio 1234" />
            </div>

            <div class="campo-fila">
              <div class="campo">
                <label>Ciudad</label>
                <input v-model="perfilProfesional.form.ciudad" placeholder="Ej: Montevideo" />
              </div>
              <div class="campo">
                <label>País</label>
                <input v-model="perfilProfesional.form.pais" placeholder="Ej: UY" maxlength="3" />
              </div>
            </div>

            <div class="perfil-mapa-bloque">
              <MapaUbicacion
                v-model:latitud="perfilProfesional.form.latitud"
                v-model:longitud="perfilProfesional.form.longitud"
                editable
                titulo="Seleccioná la ubicación en el mapa"
                subtitulo="Hacé clic en el punto exacto donde atenderás"
                ayuda="También podés mover el marcador arrastrándolo una vez colocado."
                height="320px"
              />

              <div class="perfil-mapa-acciones">
                <button type="button" class="boton-secundario" @click="usarUbicacionActual">
                  📍 Usar mi ubicación actual
                </button>
                <div class="perfil-coordenadas">
                  <span>Lat: {{ mostrarCoordenadas(perfilProfesional.form.latitud) }}</span>
                  <span>Lng: {{ mostrarCoordenadas(perfilProfesional.form.longitud) }}</span>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="alerta alerta--info">
            La modalidad remota no necesita una ubicación física.
          </div>

          <div class="campo" style="margin-top:1rem">
            <label>Horas mínimas para cancelar</label>
            <input v-model.number="perfilProfesional.form.horas_cancelacion" type="number" min="0" max="168" step="1" />
            <small class="campo-ayuda">Se usa para respetar la política de cancelación del profesional.</small>
          </div>

          <p v-if="mensajeUbicacionExito" class="alerta alerta--exito">{{ mensajeUbicacionExito }}</p>
          <p v-if="mensajeUbicacionError" class="alerta alerta--error">{{ mensajeUbicacionError }}</p>

          <div style="display:flex;justify-content:flex-end;margin-top:.5rem">
            <button class="boton-principal" :disabled="guardandoUbicacion" @click="guardarUbicacion">
              {{ guardandoUbicacion ? 'Guardando...' : 'Guardar ubicación' }}
            </button>
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
import MapaUbicacion from '@/components/MapaUbicacion.vue'

const auth = useAuthStore()

const formulario   = ref({ name: '', telefono: '', notificaciones_email: true })
const archivoAvatar  = ref(null)
const previstaAvatar = ref(null)
const errorAvatar    = ref('')
const guardando      = ref(false)
const mensajeExito   = ref('')
const mensajeError   = ref('')
const guardandoUbicacion = ref(false)
const mensajeUbicacionExito = ref('')
const mensajeUbicacionError = ref('')
const esProfesional = computed(() => auth.usuario?.rol === 'profesional' && !!auth.usuario?.profesional)
const perfilProfesional = ref({
  form: {
    modalidad: 'hibrida',
    direccion: '',
    ciudad: '',
    pais: 'UY',
    latitud: null,
    longitud: null,
    horas_cancelacion: 24,
  },
})

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

  if (auth.usuario?.profesional) {
    perfilProfesional.value.form = {
      modalidad: auth.usuario.profesional.modalidad || 'hibrida',
      direccion: auth.usuario.profesional.direccion || '',
      ciudad: auth.usuario.profesional.ciudad || '',
      pais: auth.usuario.profesional.pais || 'UY',
      latitud: auth.usuario.profesional.latitud ?? null,
      longitud: auth.usuario.profesional.longitud ?? null,
      horas_cancelacion: auth.usuario.profesional.horas_cancelacion ?? 24,
    }
  }
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

function mostrarCoordenadas(valor) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero.toFixed(6) : '—'
}

async function usarUbicacionActual() {
  mensajeUbicacionError.value = ''
  mensajeUbicacionExito.value = ''

  if (!navigator.geolocation) {
    mensajeUbicacionError.value = 'Tu navegador no soporta geolocalización.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      perfilProfesional.value.form.latitud = posicion.coords.latitude
      perfilProfesional.value.form.longitud = posicion.coords.longitude
      mensajeUbicacionExito.value = 'Ubicación actual detectada. Revisa el mapa y guardá los cambios.'
    },
    () => {
      mensajeUbicacionError.value = 'No se pudo obtener tu ubicación actual.'
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

async function guardarUbicacion() {
  if (!auth.usuario?.profesional?.id) return

  mensajeUbicacionExito.value = ''
  mensajeUbicacionError.value = ''
  guardandoUbicacion.value = true

  try {
    const payload = {
      modalidad: perfilProfesional.value.form.modalidad,
      direccion: perfilProfesional.value.form.modalidad === 'remota' ? null : perfilProfesional.value.form.direccion,
      ciudad: perfilProfesional.value.form.modalidad === 'remota' ? null : perfilProfesional.value.form.ciudad,
      pais: perfilProfesional.value.form.modalidad === 'remota' ? null : perfilProfesional.value.form.pais,
      latitud: perfilProfesional.value.form.modalidad === 'remota' ? null : perfilProfesional.value.form.latitud,
      longitud: perfilProfesional.value.form.modalidad === 'remota' ? null : perfilProfesional.value.form.longitud,
      horas_cancelacion: perfilProfesional.value.form.horas_cancelacion,
    }

    const { data } = await axios.put(`/api/profesionales/${auth.usuario.profesional.id}`, payload)
    auth.usuario.profesional = { ...auth.usuario.profesional, ...data }
    localStorage.setItem('usuario', JSON.stringify(auth.usuario))
    mensajeUbicacionExito.value = 'Ubicación del profesional actualizada correctamente.'
  } catch (e) {
    mensajeUbicacionError.value = e.response?.data?.message || 'No se pudo guardar la ubicación.'
  } finally {
    guardandoUbicacion.value = false
  }
}
</script>

