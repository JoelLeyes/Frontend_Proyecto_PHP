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

<style scoped>
.layout-panel-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout-panel {
  flex: 1;
  display: flex;
}
</style>
