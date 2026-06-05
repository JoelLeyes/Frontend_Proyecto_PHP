import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { getEcho } from '../services/echo.js';
import { useNotificationStore } from '../stores/notificationStore.js';
import { useAuthStore } from '../stores/auth.js';

export function useReservationEvents() {
  const notifications = useNotificationStore();
  const auth = useAuthStore();
  const reservations = ref([]);
  const pendingReservations = ref([]);
  const confirmedReservations = ref([]);
  const updatingReservationIds = ref(new Set());
  const currentChannel = ref(null);

  // Obtener el ID del usuario autenticado
  const userId = computed(() => {
    return auth.usuario?.id || null;
  });

  const listenToReservationEvents = () => {
    if (!userId.value) {
      console.warn('Usuario no autenticado, no se pueden escuchar eventos de reservas');
      return;
    }

    const echo = getEcho();
    const channelName = `reservas.${userId.value}`;

    if (currentChannel.value && currentChannel.value !== channelName) {
      echo.leaveChannel(currentChannel.value);
    }
    currentChannel.value = channelName;

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
      if (currentChannel.value) {
        echo.leaveChannel(currentChannel.value);
        currentChannel.value = null;
      }
    }
  };

  onMounted(() => {
    listenToReservationEvents();
  });

  watch(userId, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
      listenToReservationEvents();
    }
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
