import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Contacto } from './pages/contacto/contacto';
import { LoginComponent } from './pages/login/login';
import { AdminComponent } from './pages/admin/admin';

export const routes: Routes = [
    { path: '', component: Home }, // La ruta principal carga el Inicio
    { path: 'contacto', component: Contacto }, // misitio.com/contacto
    { path: 'login', component: LoginComponent },//para el login
    { path: 'admin', component: AdminComponent },//para el admin
    { path: '**', redirectTo: '' } // Si escriben una URL que no existe, los regresa al inicio
];