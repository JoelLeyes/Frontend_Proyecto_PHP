import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
//ssss
const rutas = [
    {
        path: '/',
        component: () => import('@/layouts/LayoutPublico.vue'),
        children: [
            { path: '', name: 'inicio', component: () => import('@/views/InicioView.vue') },
            { path: 'profesionales', name: 'profesionales', component: () => import('@/views/ProfesionalesView.vue') },
            { path: 'profesionales/:id', name: 'detalle-profesional', component: () => import('@/views/DetalleProfesionalView.vue') },
        ],
    },
    {
        path: '/auth',
        component: () => import('@/layouts/LayoutAuth.vue'),
        children: [
            { path: 'iniciar-sesion', name: 'iniciar-sesion', component: () => import('@/views/IniciarSesionView.vue') },
            { path: 'registrarse', name: 'registrarse', component: () => import('@/views/RegistrarseView.vue') },
        ],
    },
    {
        path: '/panel',
        component: () => import('@/layouts/LayoutPanel.vue'),
        meta: { requiereAuth: true },
        children: [
            { path: '', name: 'panel', component: () => import('@/views/PanelView.vue') },
            { path: 'reservas', name: 'mis-reservas', component: () => import('@/views/ReservasView.vue') },
            { path: 'perfil', name: 'mi-perfil', component: () => import('@/views/PerfilView.vue') },
            {
                path: 'servicios',
                name: 'mis-servicios',
                component: () => import('@/views/ServiciosView.vue'),
                meta: { rol: 'profesional' },
            },
            {
                path: 'disponibilidad',
                name: 'mi-disponibilidad',
                component: () => import('@/views/DisponibilidadView.vue'),
                meta: { rol: 'profesional' },
            },
            {
                path: 'cobros',
                name: 'mis-cobros',
                component: () => import('@/views/PagosView.vue'),
                meta: { rol: 'profesional' },
            },
            {
                path: 'paquetes',
                name: 'mis-paquetes',
                component: () => import('@/views/PaquetesView.vue'),
                meta: { rol: 'cliente' },
            },
            {
                path: 'admin',
                name: 'panel-admin',
                component: () => import('@/views/AdminView.vue'),
                meta: { rol: 'admin' },
            },
        ],
    },
]

const enrutador = createRouter({
    history: createWebHistory(),
    routes: rutas,
})

// Guardia de navegación: verifica autenticación y rol
enrutador.beforeEach((destino) => {
    const auth = useAuthStore()

    if (destino.meta.requiereAuth && !auth.estaLogueado) {
        return { name: 'iniciar-sesion' }
    }

    if (destino.meta.rol && auth.usuario?.rol !== destino.meta.rol) {
        return { name: 'panel' }
    }
})

export default enrutador
