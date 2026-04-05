import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  path: string;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayoutComponent {
  private router = inject(Router);


  drawerOpen = false;
  sidebarCollapsed = false; // Controlamos el colapso manualmente por ahora
  usuarioLogueado = 'Admin';

  // 🟢 MENÚ ADAPTADO PARA AMAZON NUTS
  menuItems: MenuItem[] = [
    {
      path: '/admin/dashboard',
      title: 'Cotizaciones',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      path: '/admin/trabajador',
      title: 'Personal (QR)',
      icon: 'M10 19l-7-7m0 0l7-7m-7 7h18' // Puedes cambiar los iconos SVG luego
    }
  ];


  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  cerrarSesion() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}