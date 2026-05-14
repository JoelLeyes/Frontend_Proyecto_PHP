// ─── ServiPro Service Worker ───────────────────────────────────────────────
// Estrategia:
//   - App shell (HTML + assets Vite): Cache First — carga instantánea
//   - Navegación (rutas SPA):         Network First + fallback a index.html
//   - API (/api/*):                   Network Only — datos siempre frescos
// ──────────────────────────────────────────────────────────────────────────

const CACHE_NAME    = 'servipro-v2'
const OFFLINE_PAGE  = '/index.html'
const SHELL_URLS    = ['/', '/index.html']

// ── Instalación: pre-cachear el shell ─────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activación: eliminar cachés antiguas ──────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ── Fetch: interceptar peticiones ─────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Solo interceptar GET del mismo origen
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // API → siempre red (datos frescos)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/storage/')) return

  // Assets Vite (hashed: /assets/index-abc.js) → Cache First
  // Son inmutables por el hash, se pueden cachear indefinidamente
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Íconos y manifest → Cache First
  if (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json') {
    event.respondWith(cacheFirst(request))
    return
  }

  // Navegación SPA → Network First, fallback a index.html para rutas client-side
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithShellFallback(request))
    return
  }

  // Resto → Network First con fallback a caché
  event.respondWith(networkFirst(request))
})

// ── Estrategias ────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached ?? new Response('Sin conexión', { status: 503 })
  }
}

async function networkFirstWithShellFallback(request) {
  try {
    return await fetch(request)
  } catch {
    // Offline: devolver index.html para que Vue Router maneje la ruta
    const shell = await caches.match(OFFLINE_PAGE)
    return shell ?? new Response('Sin conexión', { status: 503 })
  }
}
