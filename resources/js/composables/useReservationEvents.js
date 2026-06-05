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
    const channelName = `reservas.${userId.value}`;

    echo
      .private(channelName)
      .listen('.reserva.actualizada', ({ reserva }) => {
        if (!reserva) return;

        updatingReservationIds.value.add(reserva.id);

        pendingReservations.value = pendingReservations.value.filter((r) => r.id !== reserva.id);
        confirmedReservations.value = confirmedReservations.value.filter((r) => r.id !== reserva.id);

        if (['pendiente'].includes(reserva.estado)) {
          pendingReservations.value = [...pendingReservations.value, reserva];
        } else if (['confirmada', 'pagada', 'en_curso'].includes(reserva.estado)) {
          confirmedReservations.value = [...confirmedReservations.value, reserva];
        }

        setTimeout(() => updatingReservationIds.value.delete(reserva.id), 300);
      });
  };

  const stopListeningToReservationEvents = () => {
    if (userId.value) {
      const echo = getEcho();
      echo.leaveChannel(`reservas.${userId.value}`);
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
