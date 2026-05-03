<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Panel Administrativo</h1>
    </div>

    <div v-if="cargando" class="cargando">Cargando estadísticas...</div>

    <template v-else>

      <!-- ═══ ESTADÍSTICAS ═══ -->
      <template v-if="estadisticas">
        <h2 class="admin-seccion-titulo">Usuarios</h2>
        <div class="estadisticas">
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.usuarios.total }}</div>
            <div class="estadistica-tarjeta__etiqueta">Total de usuarios</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.usuarios.clientes }}</div>
            <div class="estadistica-tarjeta__etiqueta">Clientes</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.usuarios.profesionales }}</div>
            <div class="estadistica-tarjeta__etiqueta">Profesionales</div>
          </div>
        </div>

        <h2 class="admin-seccion-titulo">Reservas</h2>
        <div class="estadisticas">
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.reservas.total }}</div>
            <div class="estadistica-tarjeta__etiqueta">Total de reservas</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.reservas.pendientes }}</div>
            <div class="estadistica-tarjeta__etiqueta">Pendientes</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.reservas.confirmadas }}</div>
            <div class="estadistica-tarjeta__etiqueta">Confirmadas</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.reservas.finalizadas }}</div>
            <div class="estadistica-tarjeta__etiqueta">Finalizadas</div>
          </div>
          <div class="estadistica-tarjeta">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.reservas.canceladas }}</div>
            <div class="estadistica-tarjeta__etiqueta">Canceladas</div>
          </div>
        </div>

        <h2 class="admin-seccion-titulo">Profesionales</h2>
        <div class="estadisticas">
          <div class="estadistica-tarjeta estadistica-tarjeta--verde">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.profesionales.activos }}</div>
            <div class="estadistica-tarjeta__etiqueta">Activos</div>
          </div>
          <div class="estadistica-tarjeta estadistica-tarjeta--gris">
            <div class="estadistica-tarjeta__valor">{{ estadisticas.profesionales.inactivos }}</div>
            <div class="estadistica-tarjeta__etiqueta">Inactivos</div>
          </div>
        </div>
      </template>

      <!-- ═══ TABLA DE USUARIOS ═══ -->
      <div class="admin-bloque">
        <div class="admin-bloque__cabecera">
          <h2 class="admin-seccion-titulo" style="margin-bottom:0">Gestión de usuarios</h2>
          <div class="admin-filtros">
            <input
              v-model="filtros.busqueda"
              type="search"
              placeholder="Buscar por nombre o email..."
              class="admin-filtros__busqueda"
              @input="debounceBuscar"
            />
            <select v-model="filtros.rol" @change="cargarUsuarios(1)">
              <option value="">Todos los roles</option>
              <option value="cliente">Clientes</option>
              <option value="profesional">Profesionales</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div v-if="cargandoUsuarios" class="cargando" style="padding:2rem">Cargando usuarios...</div>

        <template v-else>
          <div class="tabla-wrapper">
            <table class="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuarios.data" :key="usuario.id">
                  <td>{{ usuario.name }}</td>
                  <td class="tabla__email">{{ usuario.email }}</td>
                  <td><span :class="'chip-rol chip-rol--' + usuario.rol">{{ usuario.rol }}</span></td>
                  <td>
                    <span :class="usuario.activo ? 'chip-verde' : 'chip-rojo'">
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="tabla__fecha">{{ formatearFecha(usuario.created_at) }}</td>
                  <td>
                    <button
                      :class="usuario.activo ? 'boton-secundario boton-sm boton-peligro' : 'boton-principal boton-sm'"
                      :disabled="toggleando === usuario.id"
                      @click="toggleActivar(usuario)"
                    >
                      {{ toggleando === usuario.id ? '...' : (usuario.activo ? 'Desactivar' : 'Activar') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div v-if="usuarios.last_page > 1" class="paginacion">
            <button
              v-for="p in usuarios.last_page" :key="p"
              :class="['paginacion__btn', p === usuarios.current_page && 'paginacion__btn--activo']"
              @click="cargarUsuarios(p)"
            >{{ p }}</button>
          </div>
        </template>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const estadisticas    = ref(null)
const cargando        = ref(true)
const cargandoUsuarios = ref(false)
const toggleando      = ref(null)
let buscarTimeout     = null

const usuarios = ref({ data: [], current_page: 1, last_page: 1 })
const filtros  = ref({ busqueda: '', rol: '' })

function debounceBuscar() {
  clearTimeout(buscarTimeout)
  buscarTimeout = setTimeout(() => cargarUsuarios(1), 400)
}

function formatearFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function cargarEstadisticas() {
  try {
    const { data } = await axios.get('/api/admin/estadisticas')
    estadisticas.value = data
  } catch { /* sin permisos u otro error — se omite silenciosamente */ }
}

async function cargarUsuarios(pagina = 1) {
  cargandoUsuarios.value = true
  try {
    const { data } = await axios.get('/api/admin/usuarios', {
      params: { page: pagina, rol: filtros.value.rol || undefined, busqueda: filtros.value.busqueda || undefined },
    })
    usuarios.value = data
  } finally {
    cargandoUsuarios.value = false
  }
}

async function toggleActivar(usuario) {
  toggleando.value = usuario.id
  try {
    const { data } = await axios.patch(`/api/admin/usuarios/${usuario.id}/activar`)
    usuario.activo = data.usuario.activo
  } catch (e) {
    alert(e.response?.data?.error || 'No se pudo cambiar el estado del usuario.')
  } finally {
    toggleando.value = null
  }
}

onMounted(async () => {
  await Promise.all([cargarEstadisticas(), cargarUsuarios()])
  cargando.value = false
})
</script>

<style scoped>
.admin-seccion-titulo {
  font-size: .875rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--color-texto-suave); margin-bottom: .875rem;
}
.admin-seccion-titulo + .estadisticas { margin-bottom: 2rem; }

.estadistica-tarjeta--verde { border-top: 3px solid #22c55e; }
.estadistica-tarjeta--gris  { border-top: 3px solid var(--color-borde-suave); }

.admin-bloque {
  background: #fff; border: 1px solid var(--color-borde-suave);
  border-radius: calc(var(--radio-borde) * 1.5); padding: 1.5rem;
  box-shadow: var(--sombra); margin-top: 1rem;
}
.admin-bloque__cabecera {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap;
}
.admin-filtros { display: flex; gap: .75rem; flex-wrap: wrap; }
.admin-filtros__busqueda { min-width: 220px; }

.tabla-wrapper { overflow-x: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: .875rem; }
.tabla th { text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .05em; color: var(--color-texto-suave); padding: .5rem .75rem; border-bottom: 2px solid var(--color-borde-suave); white-space: nowrap; }
.tabla td { padding: .625rem .75rem; border-bottom: 1px solid var(--color-borde-suave); vertical-align: middle; }
.tabla tbody tr:last-child td { border-bottom: none; }
.tabla tbody tr:hover { background: var(--color-fondo); }
.tabla__email { color: var(--color-texto-suave); font-size: .8125rem; }
.tabla__fecha { color: var(--color-texto-suave); font-size: .8125rem; white-space: nowrap; }

.chip-rol { display: inline-block; padding: .125rem .625rem; border-radius: 9999px; font-size: .75rem; font-weight: 600; text-transform: capitalize; }
.chip-rol--cliente      { background: #dbeafe; color: #1e40af; }
.chip-rol--profesional  { background: #d1fae5; color: #065f46; }
.chip-rol--admin        { background: #fef3c7; color: #92400e; }
.chip-verde { display: inline-block; padding: .125rem .625rem; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: .75rem; font-weight: 600; }
.chip-rojo  { display: inline-block; padding: .125rem .625rem; background: #fee2e2; color: #991b1b; border-radius: 9999px; font-size: .75rem; font-weight: 600; }

.boton-sm { padding: .35rem .75rem; font-size: .8125rem; }
.boton-peligro { border-color: #ef4444; color: #ef4444; }
.boton-peligro:hover { background: #fee2e2; border-color: #dc2626; color: #dc2626; }

.paginacion { display: flex; gap: .375rem; justify-content: center; margin-top: 1.25rem; flex-wrap: wrap; }
.paginacion__btn { padding: .375rem .75rem; border: 1px solid var(--color-borde-suave); border-radius: var(--radio-borde); background: #fff; cursor: pointer; font-size: .875rem; color: var(--color-texto-medio); transition: background .15s, border-color .15s; }
.paginacion__btn:hover { border-color: var(--color-primario); color: var(--color-primario); }
.paginacion__btn--activo { background: var(--color-primario); border-color: var(--color-primario); color: #fff; font-weight: 600; }

.estado-vacio { text-align: center; padding: 4rem; color: var(--color-texto-suave); }
.estado-vacio__icono { font-size: 3rem; margin-bottom: 1rem; }
</style>
