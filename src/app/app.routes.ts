import { Routes } from '@angular/router';

// ==========================================
// 📥 IMPORTACIONES DE COMPONENTES
// ==========================================

// 🌐 Páginas Públicas y Standalone
import { Home } from './pages/home/home';
import { Contacto } from './pages/contacto/contacto';
import { LoginComponent } from './pages/login/login';
import { EscanerQrComponent } from './pages/escaner-qr/escaner-qr'; // 🔥 NUEVO: Componente del Lector QR

// 🛡️ Layout Principal del Administrador
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { ControlOperacionesComponent } from './pages/control-operaciones/control-operaciones';

// 📦 Componentes del Panel de Administración (Hijos)
import { DashboardComponent } from './pages/dashboard/dashboard';
import { Admin } from './pages/admin/admin'; // Cotizaciones/Mensajes
import { Trabajador } from './components/trabajador/trabajador';
import { Asistencia } from './components/asistencia/asistencia';
import { ReportesAsistenciaComponent } from './components/reportes-asistencia/reportes-asistencia';
import { Turnos } from './pages/turnos/turnos';
import { ConfiguracionComponent } from './pages/configuracion/configuracion';

//Operaciones
import { OperacionesFajaComponent } from './pages/operaciones-faja/operaciones-faja';

// ==========================================
// 🚀 CONFIGURACIÓN DE RUTAS
// ==========================================
export const routes: Routes = [

    // ------------------------------------------
    // 1. RUTAS PÚBLICAS Y PANTALLAS COMPLETAS
    // (No tienen menú lateral ni barra superior)
    // ------------------------------------------
    { path: '', component: Home },
    { path: 'contacto', component: Contacto },
    { path: 'login', component: LoginComponent },

    // 🚪 RUTA DEL ESCÁNER: Fija en la puerta de la planta (Pantalla Completa)
    // { path: 'escaner-qr', component: EscanerQrComponent },

    // ------------------------------------------
    // 2. RUTAS ADMINISTRATIVAS
    // (Envueltas en el AdminLayoutComponent)
    // ------------------------------------------
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [

            //operaciones
            { path: 'operaciones/faja', component: OperacionesFajaComponent },
            // Redirección por defecto al entrar a /admin
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            // Módulos del sistema
            { path: 'dashboard', component: DashboardComponent },
            { path: 'cotizaciones', component: Admin }, // Bandeja de mensajes de la web
            { path: 'turnos', component: Turnos }, // Programación de turnos
            { path: 'escaner-qr', component: EscanerQrComponent },
            { path: 'trabajador', component: Trabajador }, // Gestión de personal
            { path: 'asistencia', component: Asistencia }, // Monitoreo de asistencia del día
            { path: 'reportes-asistencia', component: ReportesAsistenciaComponent }, // Historial y filtros
            { path: 'configuracion', component: ConfiguracionComponent }, // Historial y filtros
            { path: 'operaciones/control', component: ControlOperacionesComponent },
        ]
    },

    // ------------------------------------------
    // 3. RUTA COMODÍN (Debe ir SIEMPRE al final)
    // ------------------------------------------
    // Si el usuario escribe una URL que no existe, lo manda a la página principal
    { path: '**', redirectTo: '' }
];