<template>
  <div>
    <div class="layout-panel__encabezado" style="display:flex;align-items:center;justify-content:space-between">
      <h1 class="layout-panel__titulo-pagina">Mis Servicios</h1>
      <button class="boton-principal" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? '✕ Cancelar' : '+ Nuevo servicio' }}
      </button>
    </div>

    <!-- Formulario nuevo servicio -->
    <div v-if="mostrarFormulario" class="tarjeta form-nuevo-servicio">
      <h3 style="margin-bottom:1.25rem">Agregar servicio</h3>
      <p v-if="errorForm" class="alerta alerta--error">{{ errorForm }}</p>
      <form @submit.prevent="crearServicio">
        <div class="campo-fila">
          <div class="campo">
            <label>Nombre del servicio</label>
            <input v-model="nuevoServicio.nombre" placeholder="Ej: Sesión de coaching" required />
          </div>
          <div class="campo">
            <label>Modalidad</label>
            <select v-model="nuevoServicio.modalidad" required>
              <option value="presencial">Presencial</option>
              <option value="remota">Remota</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </div>
        </div>
        <div class="campo">
          <label>Descripción</label>
          <textarea v-model="nuevoServicio.descripcion" placeholder="Describí brevemente el servicio..." rows="2"></textarea>
        </div>
        <div class="campo-fila">
          <div class="campo">
            <label>Precio ($)</label>
            <input v-model.number="nuevoServicio.precio" type="number" min="0" step="0.01" placeholder="0.00" required />
          </div>
          <div class="campo">
            <label>Duración (minutos)</label>
            <input v-model.number="nuevoServicio.duracion_minutos" type="number" min="15" step="15" placeholder="60" required />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.75rem">
          <button type="button" class="boton-secundario" @click="mostrarFormulario = false">Cancelar</button>
          <button type="submit" class="boton-principal" :disabled="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar servicio' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de servicios -->
    <div v-if="cargando" class="cargando">Cargando servicios...</div>

    <div v-else-if="servicios.length > 0" class="grilla-servicios">
      <div v-for="servicio in servicios" :key="servicio.id" class="tarjeta-servicio">
        <div class="tarjeta-servicio__info">
          <p class="tarjeta-servicio__nombre">{{ servicio.nombre }}</p>
          <p class="tarjeta-servicio__descripcion">{{ servicio.descripcion }}</p>
          <div class="tarjeta-servicio__meta">
            <span class="tarjeta-servicio__precio">${{ servicio.precio }}</span>
            <span class="tarjeta-servicio__duracion">⏱ {{ servicio.duracion_minutos }} min</span>
            <span class="tarjeta-servicio__duracion" style="text-transform:capitalize">{{ servicio.modalidad }}</span>
          </div>
        </div>
        <span :class="['insignia', servicio.activo ? 'insignia--confirmada' : 'insignia--cancelada']">
          {{ servicio.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </div>

    <div v-else-if="!mostrarFormulario" class="estado-vacio">
      <div class="estado-vacio__icono">💼</div>
      <h3>Sin servicios</h3>
      <p>Todavía no publicaste ningún servicio.</p>
      <button class="boton-principal" style="margin-top:1rem" @click="mostrarFormulario = true">
        + Crear primer servicio
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth              = useAuthStore()
const servicios         = ref([])
const mostrarFormulario = ref(false)
const cargando          = ref(false)
const guardando         = ref(false)
const errorForm         = ref('')

const nuevoServicio = ref({
  nombre: '', descripcion: '', precio: '', duracion_minutos: 60, modalidad: 'presencial',
})

async function cargarServicios() {
  const idProfesional = auth.usuario?.profesional?.id
  if (!idProfesional) return
  cargando.value = true
  try {
    const { data } = await axios.get(`/api/profesionales/${idProfesional}/servicios`)
    servicios.value = data
  } finally {
    cargando.value = false
  }
}

async function crearServicio() {
  errorForm.value = ''
  guardando.value = true
  const idProfesional = auth.usuario?.profesional?.id
  try {
    const { data } = await axios.post(`/api/profesionales/${idProfesional}/servicios`, nuevoServicio.value)
    servicios.value.unshift(data)
    mostrarFormulario.value = false
    nuevoServicio.value = { nombre: '', descripcion: '', precio: '', duracion_minutos: 60, modalidad: 'presencial' }
  } catch (e) {
    errorForm.value = e.response?.data?.error || 'Error al guardar el servicio.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarServicios)
</script>

<style scoped>
.form-nuevo-servicio { margin-bottom: 1.5rem; }
.estado-vacio {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--color-texto-suave);
}
.estado-vacio__icono { font-size: 3rem; margin-bottom: 1rem; }
.estado-vacio h3 { font-size: 1.25rem; color: var(--color-texto-medio); margin-bottom: 0.5rem; }
</style>
