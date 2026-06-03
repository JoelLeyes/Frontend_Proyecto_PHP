<template>
  <div class="mis-reservas-container">
    <!-- 🔴 PASO 1: Agregar NotificationsCenter aquí para ver las notificaciones -->
    <NotificationsCenter />

    <h1>Mis Reservas</h1>

    <!-- SECCIÓN: Reservas Pendientes -->
    <section v-if="esCliente" class="reservas-section">
      <h2>Reservas Pendientes (Esperando confirmación)</h2>
      <div v-if="reservasPendientes.length === 0" class="empty-state">
        No hay reservas pendientes
      </div>
      <div v-else class="reservas-grid">
        <div 
          v-for="reserva in reservasPendientes" 
          :key="reserva.id"
          class="reserva-card"
          :class="{ 'is-updating': actualizandoIds.has(reserva.id) }"
        >
          <div class="card-header">
            <h3>{{ reserva.servicio?.nombre }}</h3>
            <span class="badge badge-warning">⏳ Pendiente</span>
          </div>
          <p><strong>Profesional:</strong> {{ reserva.profesional?.nombre }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(reserva.fecha_hora) }}</p>
          <p><strong>Estado:</strong> Esperando confirmación del profesional...</p>
        </div>
      </div>
    </section>

    <!-- SECCIÓN: Reservas Confirmadas -->
    <section class="reservas-section">
      <h2>Reservas Confirmadas</h2>
      <div v-if="reservasConfirmadas.length === 0" class="empty-state">
        No hay reservas confirmadas
      </div>
      <div v-else class="reservas-grid">
        <div 
          v-for="reserva in reservasConfirmadas" 
          :key="reserva.id"
          class="reserva-card"
          :class="{ 'is-updating': actualizandoIds.has(reserva.id) }"
        >
          <div class="card-header">
            <h3>{{ reserva.servicio?.nombre }}</h3>
            <span 
              :class="[
                'badge',
                reserva.estado === 'pagada' ? 'badge-success' : 'badge-info'
              ]"
            >
              {{ reserva.estado === 'pagada' ? '✓ Pagada' : '✓ Confirmada' }}
            </span>
          </div>
          <p><strong>Profesional:</strong> {{ reserva.profesional?.nombre }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(reserva.fecha_hora) }}</p>
          <p v-if="reserva.estado === 'confirmada'">
            <span class="status-badge">Necesita pago</span>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useReservationEvents } from '@/composables/useReservationEvents';
import { formatDate } from '@/utils/dates';
import NotificationsCenter from './NotificationsCenter.vue';

// 🔴 PASO 2: Usar el composable useReservationEvents
const {
  pendingReservations,
  confirmedReservations,
  updatingReservationIds,
} = useReservationEvents();

// Alias más claros (opcional)
const reservasPendientes = pendingReservations;
const reservasConfirmadas = confirmedReservations;
const actualizandoIds = updatingReservationIds;

// Asumir que el usuario es cliente (ajustar según tu lógica)
const esCliente = computed(() => localStorage.getItem('userRole') === 'cliente');
</script>

<style scoped>
.mis-reservas-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.mis-reservas-container h1 {
  margin-bottom: 2rem;
  color: #333;
}

.reservas-section {
  margin-bottom: 3rem;
}

.reservas-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #999;
  background: white;
  border-radius: 8px;
}

.reservas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.reserva-card {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #3498db;
  transition: all 0.3s ease;
}

.reserva-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.reserva-card.is-updating {
  opacity: 0.7;
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  flex: 1;
}

.badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-warning {
  background-color: #fff3cd;
  color: #856404;
}

.badge-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-success {
  background-color: #d4edda;
  color: #155724;
}

.reserva-card p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: #666;
}

.reserva-card strong {
  color: #333;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  background-color: #ffeaa7;
  color: #d63031;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>

<!-- 
═════════════════════════════════════════════════════════════
GUÍA DE INTEGRACIÓN
═════════════════════════════════════════════════════════════

1. IMPORTAR COMPONENTES NECESARIOS
   - useReservationEvents ← Composable que escucha eventos
   - NotificationsCenter ← Muestra notificaciones
   - formatDate ← Formatea fechas

2. USAR EL COMPOSABLE
   - const { pendingReservations, confirmedReservations } = useReservationEvents()
   - Automáticamente escucha eventos en tiempo real
   - Actualiza las listas sin refrescar

3. AGREGAR NotificationsCenter EN APP.VUE
   - Para que muestre las notificaciones toast

4. GUARDAR userId AL LOGIN
   - localStorage.setItem('userId', user.id)

5. ¡LISTO!
   - Los eventos se actualizan en tiempo real
   - No necesita refrescar la página
   - Verá notificaciones al instante

═════════════════════════════════════════════════════════════
FLUJO DE EVENTOS:

Profesional confirma → ReservationConfirmed event →
  → Echo recibe → useReservationEvents actualiza →
  → pendingReservations se vacía →
  → confirmedReservations se llena →
  → Template se actualiza automáticamente (Vue reactivity)
  → NotificationsCenter muestra toast

═════════════════════════════════════════════════════════════
PUNTOS CRÍTICOS:

⚠️  localStorage.userId DEBE estar guardado después del login
⚠️  NotificationsCenter debe estar en un componente de nivel superior (App.vue)
⚠️  El puerto 8080 debe estar abierto (Reverb WebSocket)
⚠️  BROADCAST_DRIVER debe ser 'reverb' en el backend

═════════════════════════════════════════════════════════════
-->
