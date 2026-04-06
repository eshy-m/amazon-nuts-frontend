import { Routes } from '@angular/router';

// 🌐 Páginas Públicas
import { Home } from './pages/home/home';
import { Contacto } from './pages/contacto/contacto';
import { LoginComponent } from './pages/login/login';

// 🛡️ Layout Principal del Administrador
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';

// 📦 Componentes del Panel de Administración (Hijos)
import { Admin } from './pages/admin/admin'; // Este es tu Dashboard actual
import { TrabajadorComponent } from './components/trabajador/trabajador';
import { Asistencia } from './components/asistencia/asistencia';
//dashboard
import { Dashboard } from './pages/dashboard/dashboard';

// TODO: Importar estos componentes cuando se creen en el futuro:
// import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
// import { ReportesComponent } from './components/reportes/reportes.component';

export const routes: Routes = [
    // ==========================================
    // 1. RUTAS PÚBLICAS (No requieren Layout Admin)
    // ==========================================
    { path: '', component: Home },
    { path: 'contacto', component: Contacto },
    { path: 'login', component: LoginComponent },

    // ==========================================
    // 2. RUTAS PRIVADAS (Con Menú Lateral / Layout)
    // ==========================================
    {
        path: 'admin',
        component: AdminLayoutComponent, // Este componente envuelve a todas las rutas hijas
        children: [
            // Redirección por defecto: Si entras a misitio.com/admin, te lleva al dashboard
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            // 1. DASHBOARD AHORA ESTÁ EN BLANCO
            { path: 'dashboard', component: Dashboard },

            // 2. TUS MENSAJES AHORA ESTÁN EN COTIZACIONES
            { path: 'cotizaciones', component: Admin },

            // 3. LOS DEMÁS MÓDULOS
            { path: 'trabajador', component: TrabajadorComponent },
            { path: 'asistencia', component: Asistencia },
            // 🚀 Próximos módulos (Descomentar cuando se creen):
            // { path: 'cotizaciones', component: CotizacionesComponent },
            // { path: 'reportes', component: ReportesComponent },
        ]
    },

    // ==========================================
    // 3. RUTA COMODÍN (Debe ir SIEMPRE al final)
    // ==========================================
    // Si el usuario escribe una URL que no existe, lo manda a la página principal
    { path: '**', redirectTo: '' }
];