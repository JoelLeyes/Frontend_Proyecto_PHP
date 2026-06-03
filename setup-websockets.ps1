#!/usr/bin/env pwsh
# ============================================================
# Setup WebSockets - Frontend (Vue 3 + Laravel Echo)
# Ejecutar desde: Frontend_Proyecto_PHP/
# ============================================================

Write-Host "🚀 Configurando WebSockets - Frontend" -ForegroundColor Green

# 1. Instalar dependencias npm
Write-Host "`n1️⃣  Instalando dependencias de npm..." -ForegroundColor Yellow
npm install

# 2. Copiar .env.example a .env.local
Write-Host "`n2️⃣  Configurando variables de entorno..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✓ Archivo .env.local creado" -ForegroundColor Green
    Write-Host "`n📝 Verifica las variables en .env.local si usas un servidor diferente" -ForegroundColor Cyan
} else {
    Write-Host "✓ Archivo .env.local ya existe" -ForegroundColor Green
}

# 3. Iniciar servidor de desarrollo
Write-Host "`n3️⃣  Iniciando servidor de desarrollo..." -ForegroundColor Yellow
Write-Host "`n✅ El servidor estará disponible en:" -ForegroundColor Green
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host "`n📡 Se conectará a los WebSockets en:" -ForegroundColor Cyan
Write-Host "   ws://localhost:8080" -ForegroundColor Cyan

npm run dev

# ============================================================
# Puntos de verificación
# ============================================================
# ✅ Backend API corriendo en http://localhost:8000
# ✅ WebSocket Reverb corriendo en ws://localhost:8080
# ✅ Frontend Vue corriendo en http://localhost:5173
# ✅ Base de datos PostgreSQL en localhost:5432
# ✅ Redis cache en localhost:6379
#
# Si algo no funciona, ver logs:
#   docker compose logs -f reverb   (para WebSockets)
#   docker compose logs -f app      (para API)
# ============================================================
