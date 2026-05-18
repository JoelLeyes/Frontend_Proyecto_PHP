<template>
  <div class="layout-panel-wrapper">

    <NavBar />

    <div class="layout-panel">
      <main class="layout-panel__contenido">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>
