<template>
  <div class="inicio">
    <section class="hero">
      <h1>Encontrá al profesional que necesitás</h1>
      <p>Reservá turnos con profesionales de consultoría, entrenamiento, salud y más.</p>
      <RouterLink :to="{ name: 'profesionales' }" class="boton-principal">
        Ver profesionales
      </RouterLink>
    </section>
  </div>
</template>
