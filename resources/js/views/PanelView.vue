<template>
  <div>
    <!-- Saludo -->
    <div class="panel-saludo">
      <div class="panel-saludo__avatar">
        <img v-if="auth.usuario?.avatar" :src="auth.usuario.avatar" :alt="auth.usuario.name" class="panel-saludo__img" />
        <span v-else>{{ iniciales }}</span>
      </div>
      <div>
        <h1 class="panel-saludo__titulo">Bienvenido, {{ auth.usuario?.name?.split(' ')[0] }} 👋</h1>
        <p class="panel-saludo__rol">{{ etiquetaRol }}</p>
      </div>
    </div>

    <!-- ══ CLIENTE ══ -->
    <template v-if="rol === 'cliente'">

      <!-- Próximas reservas -->
      <div class="panel-seccion-header">
        <h2 class="panel-seccion-titulo">Tus próximas reservas</h2>
        <RouterLink :to="{ name: 'mis-reservas' }" class="panel-seccion-link">Ver todas →</RouterLink>
      </div>

      <div v-if="cargando" class="cargando" style="padding:2rem">Cargando...</div>

      <template v-else>
        <div v-if="proximasReservas.length" class="reservas-proximas">
          <div v-for="r in proximasReservas" :key="r.id" class="reserva-card">
            <div class="reserva-card__cabecera">
              <span :class="['insignia', insigniaEstado(r.estado)]">{{ etiquetaEstado(r.estado) }}</span>
              <span class="reserva-card__modalidad">{{ r.modalidad }}</span>
            </div>
            <p class="reserva-card__servicio">{{ r.servicio?.nombre }}</p>
            <p class="reserva-card__profesional">con {{ r.profesional?.name }}</p>
            <p class="reserva-card__fecha">📅 {{ formatearFecha(r.fecha_hora) }}</p>
            <div v-if="['pendiente','confirmada'].includes(r.estado)" class="reserva-card__acciones">
              <RouterLink :to="{ name: 'mis-reservas' }" class="boton-secundario boton-xs">
                Gestionar
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-else class="panel-vacio">
          <div class="panel-vacio__icono">📅</div>
          <p class="panel-vacio__texto">No tenés reservas activas.</p>
          <RouterLink :to="{ name: 'profesionales' }" class="boton-principal" style="margin-top:.75rem">
            Buscar profesionales
          </RouterLink>
        </div>
      </template>

      <!-- Accesos rápidos cliente -->
      <h2 class="panel-seccion-titulo" style="margin-top:2rem">Accesos rápidos</h2>
      <div class="accesos-rapidos">
        <RouterLink :to="{ name: 'profesionales' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">🔍</span>
          <span class="acceso-rapido__texto">Buscar profesionales</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mis-reservas' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">📅</span>
          <span class="acceso-rapido__texto">Mis reservas</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mis-paquetes' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">📦</span>
          <span class="acceso-rapido__texto">Mis paquetes</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mi-perfil' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">👤</span>
          <span class="acceso-rapido__texto">Mi perfil</span>
        </RouterLink>
      </div>
    </template>

    <!-- ══ PROFESIONAL ══ -->
    <template v-else-if="rol === 'profesional'">

      <!-- Pendientes de confirmar -->
      <div class="panel-seccion-header">
        <h2 class="panel-seccion-titulo">
          Reservas pendientes
          <span v-if="pendientes.length" class="badge-rojo">{{ pendientes.length }}</span>
        </h2>
        <RouterLink :to="{ name: 'mis-reservas' }" class="panel-seccion-link">Ver todas →</RouterLink>
      </div>

      <div v-if="cargando" class="cargando" style="padding:2rem">Cargando...</div>

      <template v-else>
        <div v-if="pendientes.length" class="reservas-proximas">
          <div v-for="r in pendientes" :key="r.id" class="reserva-card reserva-card--pendiente">
            <div class="reserva-card__cabecera">
              <span class="insignia insignia--pendiente">Pendiente</span>
              <span class="reserva-card__modalidad">{{ r.modalidad }}</span>
            </div>
            <p class="reserva-card__servicio">{{ r.servicio?.nombre }}</p>
            <p class="reserva-card__profesional">Cliente: <strong>{{ r.cliente?.name }}</strong></p>
            <p class="reserva-card__fecha">📅 {{ formatearFecha(r.fecha_hora) }}</p>
            <div class="reserva-card__acciones">
              <RouterLink :to="{ name: 'mis-reservas' }" class="boton-principal boton-xs">
                Gestionar
              </RouterLink>
            </div>
          </div>
        </div>
        <div v-else class="panel-vacio">
          <div class="panel-vacio__icono">✅</div>
          <p class="panel-vacio__texto">No tenés reservas pendientes de confirmar.</p>
        </div>
      </template>

      <!-- Accesos rápidos profesional -->
      <h2 class="panel-seccion-titulo" style="margin-top:2rem">Accesos rápidos</h2>
      <div class="accesos-rapidos">
        <RouterLink :to="{ name: 'mis-reservas' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">📅</span>
          <span class="acceso-rapido__texto">Reservas</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mis-servicios' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">💼</span>
          <span class="acceso-rapido__texto">Mis servicios</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mi-disponibilidad' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">🕐</span>
          <span class="acceso-rapido__texto">Disponibilidad</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mi-perfil' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">👤</span>
          <span class="acceso-rapido__texto">Mi perfil</span>
        </RouterLink>
      </div>
    </template>

    <!-- ══ ADMIN ══ -->
    <template v-else-if="rol === 'admin'">
      <div class="accesos-rapidos">
        <RouterLink :to="{ name: 'panel-admin' }" class="acceso-rapido acceso-rapido--destacado">
          <span class="acceso-rapido__icono">⚙️</span>
          <span class="acceso-rapido__texto">Panel de administración</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mis-reservas' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">📅</span>
          <span class="acceso-rapido__texto">Reservas</span>
        </RouterLink>
        <RouterLink :to="{ name: 'mi-perfil' }" class="acceso-rapido">
          <span class="acceso-rapido__icono">👤</span>
          <span class="acceso-rapido__texto">Mi perfil</span>
        </RouterLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const auth = useAuthStore()
const rol  = computed(() => auth.usuario?.rol)

const cargando         = ref(true)
const proximasReservas = ref([])
const pendientes       = ref([])

const iniciales = computed(() => {
  const nombre = auth.usuario?.name || ''
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
})

const etiquetaRol = computed(() => {
  const mapa = { cliente: 'Cliente', profesional: 'Profesional', admin: 'Administrador' }
  return mapa[rol.value] || ''
})

const ETIQUETAS = { pendiente: 'Pendiente', confirmada: 'Confirmada', pagada: 'Pagada', en_curso: 'En curso', finalizada: 'Finalizada', cancelada: 'Cancelada' }
const INSIGNIAS = { pendiente: 'insignia--pendiente', confirmada: 'insignia--confirmada', pagada: 'insignia--pagada', en_curso: 'insignia--en-curso', finalizada: 'insignia--finalizada', cancelada: 'insignia--cancelada' }

function etiquetaEstado(e) { return ETIQUETAS[e] || e }
function insigniaEstado(e) { return INSIGNIAS[e] || '' }

function formatearFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleString('es-UY', { dateStyle: 'medium', timeStyle: 'short' })
}

async function cargarDashboard() {
  cargando.value = true
  try {
    if (rol.value === 'cliente') {
      const { data } = await axios.get('/api/reservas', {
        params: { page: 1 }
      })
      // Próximas: pendientes y confirmadas, ordenadas por fecha ascendente
      proximasReservas.value = (data.data || [])
        .filter(r => ['pendiente', 'confirmada', 'pagada'].includes(r.estado))
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
        .slice(0, 4)
    } else if (rol.value === 'profesional') {
      const { data } = await axios.get('/api/reservas', {
        params: { estado: 'pendiente', page: 1 }
      })
      pendientes.value = (data.data || [])
        .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
        .slice(0, 4)
    }
  } catch {
    // Silencioso — el usuario verá las listas vacías
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDashboard)
</script>

<style scoped>
.panel-saludo {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: linear-gradient(135deg, var(--color-primario), var(--color-primario-oscuro));
  color: #fff;
  padding: 1.75rem 2rem;
  border-radius: calc(var(--radio-borde) * 1.5);
  margin-bottom: 2rem;
  box-shadow: var(--sombra-media);
}
.panel-saludo__avatar {
  width: 60px; height: 60px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.375rem; font-weight: 700;
  flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.3);
  overflow: hidden;
}
.panel-saludo__img { width: 100%; height: 100%; object-fit: cover; }
.panel-saludo__titulo { font-size: 1.375rem; font-weight: 700; margin-bottom: .125rem; }
.panel-saludo__rol    { font-size: .875rem; opacity: .85; margin: 0; }

/* Sección header con link */
.panel-seccion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.panel-seccion-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-texto-suave);
  text-transform: uppercase;
  letter-spacing: .06em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: .5rem;
}
.panel-seccion-link {
  font-size: .875rem;
  color: var(--color-primario);
  text-decoration: none;
  font-weight: 600;
}
.panel-seccion-link:hover { text-decoration: underline; }

/* Badge rojo para pendientes */
.badge-rojo {
  background: #ef4444; color: #fff;
  font-size: .6875rem; font-weight: 700;
  padding: .1rem .45rem; border-radius: 9999px;
  line-height: 1.4;
}

/* Grid de reservas */
.reservas-proximas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: .5rem;
}

.reserva-card {
  background: #fff;
  border: 1px solid var(--color-borde-suave);
  border-radius: calc(var(--radio-borde) * 1.5);
  padding: 1.125rem 1.25rem;
  box-shadow: var(--sombra);
  display: flex;
  flex-direction: column;
  gap: .375rem;
}
.reserva-card--pendiente {
  border-left: 3px solid #f59e0b;
}
.reserva-card__cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .25rem;
}
.reserva-card__modalidad {
  font-size: .75rem;
  color: var(--color-texto-suave);
  text-transform: capitalize;
  background: var(--color-fondo);
  padding: .15rem .5rem;
  border-radius: 9999px;
}
.reserva-card__servicio    { font-weight: 700; font-size: .9375rem; margin: 0; }
.reserva-card__profesional { font-size: .8125rem; color: var(--color-texto-suave); margin: 0; }
.reserva-card__fecha       { font-size: .8125rem; color: var(--color-texto-medio); margin: 0; }
.reserva-card__acciones    { margin-top: .5rem; }
.boton-xs { padding: .3rem .75rem; font-size: .8125rem; }

/* Estado vacío */
.panel-vacio {
  text-align: center;
  padding: 2.5rem 1rem;
  background: #fff;
  border: 1px solid var(--color-borde-suave);
  border-radius: calc(var(--radio-borde) * 1.5);
  box-shadow: var(--sombra);
}
.panel-vacio__icono { font-size: 2.5rem; margin-bottom: .625rem; }
.panel-vacio__texto { color: var(--color-texto-suave); font-size: .9375rem; margin: 0; }

/* Variante destacado para admins (extiende el .acceso-rapido global) */
.acceso-rapido--destacado {
  border-color: var(--color-primario);
  background: var(--color-primario-claro);
  color: var(--color-primario-oscuro);
}
</style>
