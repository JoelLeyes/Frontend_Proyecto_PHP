<template>
  <div>
    <h1>Mi Perfil</h1>
    <!-- TODO: formulario de edición de datos personales y perfil profesional -->
    <p><strong>Nombre:</strong> {{ auth.usuario?.name }}</p>
    <p><strong>Email:</strong> {{ auth.usuario?.email }}</p>
    <p><strong>Rol:</strong> {{ auth.usuario?.rol }}</p>
    <p><strong>Teléfono:</strong> {{ auth.usuario?.telefono || 'No cargado' }}</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>
