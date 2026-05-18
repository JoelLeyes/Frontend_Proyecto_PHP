<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <h1 class="hero__titulo">Encontrá el profesional<br>que necesitás</h1>
      <p class="hero__subtitulo">
        Reservá turnos con coaches, psicólogos, tutores y más.
        Agenda online, pagos integrados y videollamadas incluidas.
      </p>
      <div class="hero__acciones">
        <RouterLink :to="{ name: 'profesionales' }" class="boton-principal">
          Buscar profesionales
        </RouterLink>
        <RouterLink :to="{ name: 'registrarse' }" class="boton-blanco">
          Registrarse gratis
        </RouterLink>
      </div>
    </section>

    <!-- Cómo funciona -->
    <section class="seccion">
      <h2 class="seccion__titulo" style="text-align:center">¿Por qué ServiPro?</h2>
      <p class="seccion__subtitulo" style="text-align:center">
        Todo lo que necesitás para gestionar o reservar servicios profesionales en un solo lugar.
      </p>
      <div class="features-grilla">
        <div class="feature-item">
          <div class="feature-item__icono">📅</div>
          <h3>Agenda online 24/7</h3>
          <p>Reservá tu turno en cualquier momento, sin llamadas ni esperas.</p>
        </div>
        <div class="feature-item">
          <div class="feature-item__icono">🔔</div>
          <h3>Notificaciones automáticas</h3>
          <p>Recibís recordatorios por email antes de cada turno.</p>
        </div>
        <div class="feature-item">
          <div class="feature-item__icono">💳</div>
          <h3>Pagos integrados</h3>
          <p>Pagá de forma segura directamente en la plataforma.</p>
        </div>
        <div class="feature-item">
          <div class="feature-item__icono">📹</div>
          <h3>Videollamadas incluidas</h3>
          <p>Para sesiones remotas, la sala virtual está lista al instante.</p>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="cta-final">
      <h2>¿Sos profesional?</h2>
      <p>Publicá tus servicios, gestioná tu agenda y llegá a más clientes.</p>
      <RouterLink :to="{ name: 'registrarse' }" class="boton-principal">
        Empezar ahora
      </RouterLink>
    </section>
  </div>
</template>
