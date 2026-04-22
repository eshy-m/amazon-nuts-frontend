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
  // 📊 ESTADO DEL LAYOUT
  // ==========================================
  drawerOpen = false;

  // Ahora es un objeto que recibirá datos del login
  usuarioLogueado: any = { name: 'Usuario', role_id: 0 };

  horaActual: Date = new Date();
  private intervaloReloj: any;

  // ==========================================
  // 📋 MENÚ LATERAL (Paths actualizados)
  // ==========================================
  menuItems: MenuItem[] = [
    {
      path: '/admin/dashboard',
      title: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7-7 7M19 10v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      path: '/admin/operaciones/control',
      title: 'Control Operaciones',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      path: '/admin/turnos',
      title: 'Gestión de Turnos',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
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
      path: '/admin/configuracion',
      title: 'Configuración',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    }
  ];

  ngOnInit() {
    // Recuperamos los datos del usuario guardados durante el login
    const data = localStorage.getItem('user_data');
    if (data) {
      this.usuarioLogueado = JSON.parse(data);
    }

    this.iniciarReloj();
  }

  ngOnDestroy() {
    if (this.intervaloReloj) {
      clearInterval(this.intervaloReloj);
    }
  }

  iniciarReloj() {
    this.intervaloReloj = setInterval(() => {
      this.horaActual = new Date();
      this.cdr.detectChanges();
    }, 1000);
  }

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }

  logout() {
    // Limpiamos el almacenamiento y redirigimos
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.router.navigate(['/login']);
  }
}