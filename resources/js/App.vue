<template>
  <div style="display:contents">
    <RouterView />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
</script>
