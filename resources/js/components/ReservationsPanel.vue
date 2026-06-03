<template>
  <div class="reservations-panel">
    <!-- Notificaciones en tiempo real -->
    <NotificationsCenter />

    <div class="panel-content">
      <h2>Mis Reservas</h2>

      <!-- Reservas Pendientes -->
      <section class="reservations-section">
        <h3 class="section-title">
          Pendientes
          <span class="badge badge-warning" v-if="pendingReservations.length > 0">
            {{ pendingReservations.length }}
          </span>
        </h3>

        <div v-if="pendingReservations.length === 0" class="empty-state">
          No hay reservas pendientes
        </div>

        <div v-else class="reservations-list">
          <div
            v-for="reserva in pendingReservations"
            :key="reserva.id"
            :class="[
              'reservation-card',
              { 'is-updating': updatingReservationIds.has(reserva.id) },
            ]"
          >
            <div class="reservation-header">
              <span class="reservation-title">{{ reserva.servicio?.nombre }}</span>
              <span class="reservation-status status-pending">Pendiente</span>
            </div>
            <div class="reservation-details">
              <p><strong>Cliente:</strong> {{ reserva.cliente?.nombre }}</p>
              <p><strong>Fecha:</strong> {{ formatDate(reserva.fecha_hora) }}</p>
              <p><strong>Modalidad:</strong> {{ reserva.modalidad }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Reservas Confirmadas -->
      <section class="reservations-section">
        <h3 class="section-title">
          Confirmadas
          <span class="badge badge-success" v-if="confirmedReservations.length > 0">
            {{ confirmedReservations.length }}
          </span>
        </h3>

        <div v-if="confirmedReservations.length === 0" class="empty-state">
          No hay reservas confirmadas
        </div>

        <div v-else class="reservations-list">
          <div
            v-for="reserva in confirmedReservations"
            :key="reserva.id"
            :class="[
              'reservation-card',
              { 'is-updating': updatingReservationIds.has(reserva.id) },
            ]"
          >
            <div class="reservation-header">
              <span class="reservation-title">{{ reserva.servicio?.nombre }}</span>
              <span
                :class="[
                  'reservation-status',
                  reserva.estado === 'pagada'
                    ? 'status-paid'
                    : 'status-confirmed',
                ]"
              >
                {{ reserva.estado === 'pagada' ? 'Pagada' : 'Confirmada' }}
              </span>
            </div>
            <div class="reservation-details">
              <p><strong>Cliente:</strong> {{ reserva.cliente?.nombre }}</p>
              <p><strong>Fecha:</strong> {{ formatDate(reserva.fecha_hora) }}</p>
              <p><strong>Modalidad:</strong> {{ reserva.modalidad }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '../utils/dates.js'; // Ajustar la ruta según sea necesario
import NotificationsCenter from './NotificationsCenter.vue';
import { useReservationEvents } from '../composables/useReservationEvents.js';

const {
  pendingReservations,
  confirmedReservations,
  updatingReservationIds,
} = useReservationEvents();
</script>

<style scoped>
.reservations-panel {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.panel-content {
  max-width: 1200px;
  margin: 0 auto;
}

.panel-content h2 {
  margin-bottom: 2rem;
  font-size: 1.875rem;
  color: #111827;
}

.reservations-section {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-success {
  background-color: #d1fae5;
  color: #065f46;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.reservations-list {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.reservation-card {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.reservation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.reservation-card.is-updating {
  opacity: 0.7;
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.reservation-title {
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.reservation-status {
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-paid {
  background-color: #d1fae5;
  color: #065f46;
}

.reservation-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.reservation-details p {
  margin: 0;
}

.reservation-details strong {
  color: #374151;
}
</style>
