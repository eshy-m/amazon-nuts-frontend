import { Routes } from '@angular/router';

// ==========================================
// 📥 IMPORTACIONES DE COMPONENTES
// ==========================================
import { Home } from './pages/home/home';
import { Contacto } from './pages/contacto/contacto';
import { LoginComponent } from './pages/login/login';
import { EscanerQrComponent } from './terminales/escaner-qr/escaner-qr';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { ControlOperacionesComponent } from './features/control-operaciones/control-operaciones';
import { DashboardComponent } from './features/dashboard/dashboard';
import { Admin } from './features/admin/admin';
import { Trabajador } from './features/trabajador/trabajador';
import { Asistencia } from './features/asistencia/asistencia';
import { ReportesAsistenciaComponent } from './features/reportes-asistencia/reportes-asistencia';
import { Turnos } from './features/turnos/turnos';
import { ConfiguracionComponent } from './features/configuracion/configuracion';
import { AreaSeleccionComponent } from './terminales/area-seleccion/area-seleccion';
import { AreaSecado } from './terminales/area-secado/area-secado';

// ==========================================
// 🚀 CONFIGURACIÓN DE RUTAS (ORDENADAS)
// ==========================================
export const routes: Routes = [

    // 1. PANTALLAS PÚBLICAS Y ACCESOS DIRECTOS
    // ------------------------------------------
    { path: 'login', component: LoginComponent },
    { path: 'contacto', component: Contacto },
    { path: 'seleccion-directo', component: AreaSeleccionComponent }, // Acceso rápido terminal Selección
    { path: 'secado-terminal', component: AreaSecado },                // <-- ¡AQUÍ ESTÁ LA NUEVA RUTA PARA EL HORNO!
    { path: '', component: Home }, // Página de inicio de la web

    // 2. RUTAS ADMINISTRATIVAS (Panel de Control Total)
    // ------------------------------------------
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'operaciones/control', component: ControlOperacionesComponent },
            { path: 'turnos', component: Turnos },
            { path: 'escaner-qr', component: EscanerQrComponent },
            { path: 'trabajador', component: Trabajador },
            { path: 'asistencia', component: Asistencia },
            { path: 'reportes-asistencia', component: ReportesAsistenciaComponent },
            { path: 'configuracion', component: ConfiguracionComponent },
            { path: 'cotizaciones', component: Admin },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ]
    },

    // 3. RUTAS DEL OPERARIO (Dashboard Personalizado)
    // ------------------------------------------
    {
        path: 'operario',
        // Por ahora cargamos los componentes directamente. 
        // En el futuro, aquí usaremos 'OperarioLayoutComponent' para tener un menú lateral propio.
        children: [
            { path: 'registros', component: AreaSeleccionComponent }, // Pantalla de ingresos e historial

            /* ⚠️ NOTA: Descomenta estas líneas cuando crees los componentes:
               { path: 'analisis', component: AnalisisComponent }, 
               { path: 'mejoras', component: MejorasComponent }, 
            */

            { path: '', redirectTo: 'registros', pathMatch: 'full' }
        ]
    },

    // 4. RUTA COMODÍN (¡SIEMPRE AL FINAL!)
    // ------------------------------------------
    // Si el usuario escribe cualquier cosa mal, lo mandamos al inicio.
    { path: '**', redirectTo: '' }
];