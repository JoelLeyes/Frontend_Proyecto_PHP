<template>
  <div>
    <NavBar />
    <div class="auth-pagina">

      <aside class="auth-panel">
        <div class="auth-panel__logo">
          <span class="auth-panel__logo-icono">🗓</span>
          ServiPro
        </div>
        <h1 class="auth-panel__titulo">
          Conectamos profesionales con quienes los necesitan
        </h1>
        <p class="auth-panel__desc">
          Gestioná turnos, servicios y pagos desde un solo lugar. Simple, rápido y seguro.
        </p>
        <ul class="auth-panel__lista">
          <li><span class="auth-check">✓</span> Agenda online disponible 24/7</li>
          <li><span class="auth-check">✓</span> Notificaciones automáticas por email</li>
          <li><span class="auth-check">✓</span> Pagos integrados y seguros</li>
          <li><span class="auth-check">✓</span> Videollamadas incluidas</li>
        </ul>
      </aside>

      <main class="auth-formulario-area">
        <RouterView />
      </main>

    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>
