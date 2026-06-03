import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([]);

  const addNotification = (notification) => {
    const id = Date.now();
    const notif = {
      id,
      type: notification.type || 'info', // success, error, warning, info
      title: notification.title || 'Notificación',
      message: notification.message || '',
      timeout: notification.timeout || 5000,
      ...notification,
    };

    notifications.value.push(notif);

    // Auto-remover después del timeout
    if (notif.timeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notif.timeout);
    }

    return id;
  };

  const removeNotification = (id) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const clearNotifications = () => {
    notifications.value = [];
  };

  // Métodos de conveniencia
  const success = (message, title = 'Éxito') => {
    return addNotification({
      type: 'success',
      title,
      message,
    });
  };

  const error = (message, title = 'Error') => {
    return addNotification({
      type: 'error',
      title,
      message,
      timeout: 7000,
    });
  };

  const warning = (message, title = 'Advertencia') => {
    return addNotification({
      type: 'warning',
      title,
      message,
    });
  };

  const info = (message, title = 'Información') => {
    return addNotification({
      type: 'info',
      title,
      message,
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
  };
});
