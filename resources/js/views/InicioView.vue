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

<style scoped>
.features-grilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}
.feature-item {
  background: #fff;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio-borde);
  padding: 1.5rem;
  text-align: center;
  box-shadow: var(--sombra);
  transition: box-shadow 0.2s, transform 0.2s;
}
.feature-item:hover {
  box-shadow: var(--sombra-media);
  transform: translateY(-3px);
}
.feature-item__icono {
  font-size: 2.25rem;
  margin-bottom: 0.75rem;
}
.feature-item h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--color-texto);
}
.feature-item p {
  font-size: 0.875rem;
  color: var(--color-texto-suave);
  margin-bottom: 0;
}
.cta-final {
  background: linear-gradient(135deg, var(--color-primario-claro), #e0f2fe);
  border-top: 1px solid var(--color-borde);
  padding: 4rem 1.5rem;
  text-align: center;
}
.cta-final h2 { font-size: 1.75rem; margin-bottom: 0.75rem; color: var(--color-texto); }
.cta-final p  { color: var(--color-texto-suave); margin-bottom: 1.5rem; }
</style>
