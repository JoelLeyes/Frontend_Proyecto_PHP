<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Mi Perfil</h1>
    </div>

    <div class="perfil-layout">
      <!-- Tarjeta de identidad -->
      <div class="tarjeta perfil-identidad">
        <div class="perfil-avatar">{{ iniciales }}</div>
        <h2 class="perfil-identidad__nombre">{{ auth.usuario?.name }}</h2>
        <p class="perfil-identidad__email">{{ auth.usuario?.email }}</p>
        <span class="insignia" :class="insigniaRol">{{ etiquetaRol }}</span>
      </div>

      <!-- Formulario de edición -->
      <div class="tarjeta perfil-formulario">
        <h3 style="margin-bottom:1.25rem">Datos personales</h3>

        <p v-if="mensajeExito" class="alerta alerta--exito">{{ mensajeExito }}</p>
        <p v-if="mensajeError"  class="alerta alerta--error">{{ mensajeError }}</p>

        <form @submit.prevent="guardar">
          <div class="campo">
            <label>Nombre completo</label>
            <input v-model="formulario.name" required />
          </div>
          <div class="campo">
            <label>Teléfono</label>
            <input v-model="formulario.telefono" placeholder="Ej: +598 99 123 456" />
          </div>
          <div style="display:flex;gap:1rem;justify-content:flex-end;margin-top:0.5rem">
            <button type="submit" class="boton-principal" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const auth = useAuthStore()

const formulario    = ref({ name: '', telefono: '' })
const guardando     = ref(false)
const mensajeExito  = ref('')
const mensajeError  = ref('')

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
  formulario.value.name     = auth.usuario?.name || ''
  formulario.value.telefono = auth.usuario?.telefono || ''
})

async function guardar() {
  mensajeExito.value = ''
  mensajeError.value = ''
  guardando.value    = true
  try {
    await axios.put('/api/auth/perfil', formulario.value)
    auth.usuario.name     = formulario.value.name
    auth.usuario.telefono = formulario.value.telefono
    mensajeExito.value    = 'Perfil actualizado correctamente.'
  } catch (e) {
    mensajeError.value = e.response?.data?.error || 'Error al guardar los cambios.'
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.perfil-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.5rem;
  align-items: start;
}
.perfil-identidad {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.perfil-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primario), var(--color-primario-oscuro));
  color: #fff;
  font-size: 1.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  box-shadow: var(--sombra-media);
}
.perfil-identidad__nombre { font-size: 1.125rem; font-weight: 700; margin-bottom: 0; }
.perfil-identidad__email  { font-size: 0.875rem; color: var(--color-texto-suave); margin-bottom: 0.5rem; }
@media (max-width: 700px) {
  .perfil-layout { grid-template-columns: 1fr; }
}
</style>
