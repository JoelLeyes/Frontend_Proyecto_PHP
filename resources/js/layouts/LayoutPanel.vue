<template>
  <div class="layout-panel-wrapper">
    <NavBar />
    <NotificationsCenter />
    <div class="layout-panel">
      <main class="layout-panel__contenido">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import NotificationsCenter from '@/components/NotificationsCenter.vue'
import { useReservationEvents } from '@/composables/useReservationEvents.js'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { onMounted } from 'vue'

useReservationEvents()

const notifStore = useNotificationStore()
onMounted(() => notifStore.cargarDesdeApi())
</script>
