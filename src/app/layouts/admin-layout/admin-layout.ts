import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // ==========================================
  // 📊 ESTADO DEL LAYOUT Y RELOJ
  // ==========================================
  drawerOpen = false;
  sidebarCollapsed = false;
  usuarioLogueado = 'Admin';

  horaActual: Date = new Date();
  private intervaloReloj: any;

  // ==========================================
  // 📋 MENÚ LATERAL
  // ==========================================
  menuItems: MenuItem[] = [
    {
      path: '/admin/dashboard',
      title: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      path: '/admin/trabajador',
      title: 'Personal',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    // 🔥 NUEVO MÓDULO AGREGADO AQUÍ
    {
      path: '/admin/turnos',
      title: 'Programar Turnos',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' // Ícono de calendario
    },
    {
      path: '/admin/asistencia',
      title: 'Asistencia Diaria',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    },
    {
      path: '/admin/reportes-asistencia',
      title: 'Reportes',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      path: '/admin/escaner-qr',
      title: 'Escáner QR',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    }
  ];

  // ==========================================
  // ⚙️ INICIO Y DESTRUCCIÓN
  // ==========================================
  ngOnInit() {
    this.iniciarReloj();
  }

  iniciarReloj() {
    this.intervaloReloj = setInterval(() => {
      this.horaActual = new Date();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervaloReloj) {
      clearInterval(this.intervaloReloj);
    }
  }

  // ==========================================
  // ⚙️ MÉTODOS DE CONTROL
  // ==========================================
  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
    this.cdr.detectChanges();
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}