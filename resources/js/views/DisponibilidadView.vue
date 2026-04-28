<template>
  <div>
    <div class="layout-panel__encabezado">
      <h1 class="layout-panel__titulo-pagina">Mi Disponibilidad</h1>
    </div>

    <div class="disponibilidad-info">
      <div class="disponibilidad-info__icono">🕐</div>
      <h2>Configurá tu agenda</h2>
      <p>
        Definí tus horarios laborales por día de la semana, establecé buffers entre turnos
        y marcá los días en que no estás disponible (feriados, licencias, etc.).
      </p>
      <div class="disponibilidad-pasos">
        <div class="disponibilidad-paso">
          <div class="disponibilidad-paso__numero">1</div>
          <div>
            <strong>Reglas de horario</strong>
            <p>Seleccioná los días que atendés y el rango horario de cada uno.</p>
          </div>
        </div>
        <div class="disponibilidad-paso">
          <div class="disponibilidad-paso__numero">2</div>
          <div>
            <strong>Buffer entre turnos</strong>
            <p>Configurá el tiempo de descanso antes y después de cada reserva.</p>
          </div>
        </div>
        <div class="disponibilidad-paso">
          <div class="disponibilidad-paso__numero">3</div>
          <div>
            <strong>Excepciones</strong>
            <p>Bloqueá días específicos para feriados o ausencias puntuales.</p>
          </div>
        </div>
      </div>
      <p class="disponibilidad-pronto">✨ Esta sección estará disponible próximamente.</p>
    </div>
  </div>
</template>

<style scoped>
.disponibilidad-info {
  background: #fff;
  border: 1px solid var(--color-borde);
  border-radius: calc(var(--radio-borde) * 1.5);
  padding: 3rem 2.5rem;
  max-width: 640px;
  box-shadow: var(--sombra);
}
.disponibilidad-info__icono { font-size: 3rem; margin-bottom: 1rem; }
.disponibilidad-info h2  { font-size: 1.375rem; margin-bottom: 0.75rem; color: var(--color-texto); }
.disponibilidad-info > p { color: var(--color-texto-suave); margin-bottom: 2rem; line-height: 1.6; }
.disponibilidad-pasos {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}
.disponibilidad-paso {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.disponibilidad-paso__numero {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primario);
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.disponibilidad-paso strong { display: block; font-size: 0.9375rem; color: var(--color-texto-medio); margin-bottom: 0.125rem; }
.disponibilidad-paso p { font-size: 0.875rem; color: var(--color-texto-suave); margin: 0; }
.disponibilidad-pronto {
  font-size: 0.9rem;
  color: var(--color-primario);
  font-weight: 500;
  background: var(--color-primario-claro);
  padding: 0.625rem 1rem;
  border-radius: var(--radio-borde);
  margin-bottom: 0;
}
</style>
