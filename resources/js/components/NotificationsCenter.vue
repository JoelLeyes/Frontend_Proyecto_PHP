<template>
  <div v-if="notifications.length > 0" class="notif-toast-contenedor">
    <transition-group name="notif-toast" tag="div">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :class="['notif-toast', `notif-toast--${notif.type}`]"
      >
        <div class="notif-toast__cuerpo">
          <div class="notif-toast__titulo">{{ notif.title }}</div>
          <div class="notif-toast__mensaje">{{ notif.message }}</div>
        </div>
        <button class="notif-toast__cerrar" @click="store.removeNotification(notif.id)" aria-label="Cerrar">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore.js'

const store         = useNotificationStore()
const notifications = computed(() => store.notifications)
</script>
