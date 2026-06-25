<template>
  <div style="display:contents">
    <RouterView /> 
    <ConfirmDialog /> 
  </div>
</template>

<script setup> // Script de configuración del componente
import { RouterView } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
</script>
