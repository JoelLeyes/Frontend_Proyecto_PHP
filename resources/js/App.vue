<template>
  <div style="display:contents">
    <RouterView /> // Renderiza el componente correspondiente a la ruta actual
    <ConfirmDialog /> // Componente de diálogo de confirmación global
  </div>
</template>

<script setup> // Script de configuración del componente
import { RouterView } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
</script>
