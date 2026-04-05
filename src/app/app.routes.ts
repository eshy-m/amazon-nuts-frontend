import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Contacto } from './pages/contacto/contacto';
import { LoginComponent } from './pages/login/login';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout'; // <--- IMPORTA EL LAYOUT
import { Admin } from './pages/admin/admin';
import { TrabajadorComponent } from './components/trabajador/trabajador';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'contacto', component: Contacto },
    { path: 'login', component: LoginComponent },

    // 🟢 NUEVA ESTRUCTURA DE RUTAS (Padre e Hijos)
    {
        path: 'admin',
        component: AdminLayoutComponent, // El Layout carga primero
        children: [
            // Cuando entres a /admin , te redirige a /admin/dashboard
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

            // misitio.com/admin/dashboard (Carga tus Cotizaciones)
            { path: 'dashboard', component: Admin },

            // misitio.com/admin/trabajador (Carga el Personal)
            { path: 'trabajador', component: TrabajadorComponent }
        ]
    },

    { path: '**', redirectTo: '' }
];