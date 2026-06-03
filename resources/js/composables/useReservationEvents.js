import { ref, onMounted, onUnmounted, computed } from 'vue';
import { getEcho } from '../services/echo.js';
import { useNotificationStore } from '../stores/notificationStore.js';

export function useReservationEvents() {
  const notifications = useNotificationStore();
  const reservations = ref([]);
  const pendingReservations = ref([]);
  const confirmedReservations = ref([]);
  const updatingReservationIds = ref(new Set());

  // Obtener el ID del usuario autenticado
  const userId = computed(() => {
    // Asumir que el ID está guardado en localStorage después del login
    return localStorage.getItem('userId');
  });

  const listenToReservationEvents = () => {
    if (!userId.value) {
      console.warn('Usuario no autenticado, no se pueden escuchar eventos de reservas');
      return;
    }

    const echo = getEcho();
    const channelName = `reservations.${userId.value}`;

    echo
      .private(channelName)
      .listen('reservation.created', (event) => {
        console.log('Evento: Nueva reserva', event);
        const reserva = event.reserva;
        pendingReservations.value = [
          ...pendingReservations.value.filter((r) => r.id !== reserva.id),
          reserva,
        ];
        notifications.info(`Nueva solicitud de reserva de ${reserva.cliente?.nombre || 'un cliente'}`, 'Reserva nueva');
      })
      .listen('reservation.confirmed', (event) => {
        console.log('Evento: Reserva confirmada', event);
        const reserva = event.reserva;
        updatingReservationIds.value.add(reserva.id);

        // Actualizar en las listas
        pendingReservations.value = pendingReservations.value.filter((r) => r.id !== reserva.id);
        confirmedReservations.value = [
          ...confirmedReservations.value.filter((r) => r.id !== reserva.id),
          { ...reserva, estado: 'confirmada' },
        ];

        setTimeout(() => updatingReservationIds.value.delete(reserva.id), 300);
        notifications.success('Reserva confirmada correctamente', 'Estado actualizado');
      })
      .listen('reservation.completed', (event) => {
        console.log('Evento: Reserva finalizada', event);
        const reserva = event.reserva;
        updatingReservationIds.value.add(reserva.id);

        // Actualizar en las listas
        pendingReservations.value = pendingReservations.value.filter((r) => r.id !== reserva.id);
        confirmedReservations.value = confirmedReservations.value.filter((r) => r.id !== reserva.id);

        setTimeout(() => updatingReservationIds.value.delete(reserva.id), 300);
        notifications.success('Reserva finalizada', 'Reserva completada');
      })
      .listen('reservation.cancelled', (event) => {
        console.log('Evento: Reserva cancelada', event);
        const reserva = event.reserva;
        updatingReservationIds.value.add(reserva.id);

        // Remover de las listas
        pendingReservations.value = pendingReservations.value.filter((r) => r.id !== reserva.id);
        confirmedReservations.value = confirmedReservations.value.filter((r) => r.id !== reserva.id);

        setTimeout(() => updatingReservationIds.value.delete(reserva.id), 300);
        notifications.warning('Reserva cancelada', 'Acción realizada');
      })
      .listen('payment.received', (event) => {
        console.log('Evento: Pago recibido', event);
        const pago = event.pago;
        const reserva = event.reserva;

        // Actualizar el estado de la reserva a "pagada"
        const index = confirmedReservations.value.findIndex((r) => r.id === reserva.id);
        if (index >= 0) {
          confirmedReservations.value[index] = {
            ...confirmedReservations.value[index],
            estado: 'pagada',
          };
        }

        notifications.success(
          `Pago de $${pago.monto} recibido correctamente`,
          'Pago confirmado'
        );
      });
  };

  const stopListeningToReservationEvents = () => {
    if (userId.value) {
      const echo = getEcho();
      echo.leaveChannel(`reservations.${userId.value}`);
    }
  };

  onMounted(() => {
    listenToReservationEvents();
  });

  onUnmounted(() => {
    stopListeningToReservationEvents();
  });

  return {
    reservations,
    pendingReservations,
    confirmedReservations,
    updatingReservationIds,
    listenToReservationEvents,
    stopListeningToReservationEvents,
  };
}
