import Echo from 'laravel-echo';
import io from 'socket.io-client';

// Configurar Echo con Socket.IO
window.io = io;

let echo = null;

export function initializeEcho() {
  if (echo) {
    return echo;
  }

  const reverb_host = import.meta.env.VITE_REVERB_HOST || 'localhost';
  const reverb_port = import.meta.env.VITE_REVERB_PORT || 8080;
  const reverb_scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';

  echo = new Echo({
    broadcaster: 'socket.io',
    host: `${reverb_scheme}://${reverb_host}:${reverb_port}`,
    client: io,
    rejectUnauthorizedRequests: false,
  });

  // Log de conexión
  echo.connector.socket.on('connect', () => {
    console.log('✓ WebSocket conectado');
  });

  echo.connector.socket.on('disconnect', () => {
    console.warn('✗ WebSocket desconectado');
  });

  echo.connector.socket.on('connect_error', (error) => {
    console.error('Error de conexión WebSocket:', error);
  });

  return echo;
}

export function getEcho() {
  if (!echo) {
    return initializeEcho();
  }
  return echo;
}

export function disconnectEcho() {
  if (echo) {
    echo.disconnect();
    echo = null;
  }
}
