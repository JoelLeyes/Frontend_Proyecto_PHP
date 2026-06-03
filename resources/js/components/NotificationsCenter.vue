<template>
  <div class="notifications-container" v-if="notifications.length > 0">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
      >
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button
          class="notification-close"
          @click="() => removeNotification(notification.id)"
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNotificationStore } from '../stores/notificationStore.js';

const store = useNotificationStore();
const notifications = computed(() => store.notifications);

const removeNotification = (id) => {
  store.removeNotification(id);
};
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 28rem;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.875rem;
  line-height: 1.4;
  word-break: break-word;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
}

/* Tipos de notificaciones */
.notification-success {
  border-left: 4px solid #10b981;
}

.notification-success .notification-title {
  color: #059669;
}

.notification-error {
  border-left: 4px solid #ef4444;
}

.notification-error .notification-title {
  color: #dc2626;
}

.notification-warning {
  border-left: 4px solid #f59e0b;
}

.notification-warning .notification-title {
  color: #d97706;
}

.notification-info {
  border-left: 4px solid #3b82f6;
}

.notification-info .notification-title {
  color: #1d4ed8;
}

/* Animación de salida */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
