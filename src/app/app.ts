import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  // 👇 Limpiamos ZXingScannerModule de aquí
  imports: [CommonModule, RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  mostrarLayoutPublico = true;
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects || event.url || '';
        // 🚦 Si la URL contiene /login, /admin o /operario, ocultamos el layout público
        this.mostrarLayoutPublico = !(
          url.includes('/login') ||
          url.includes('/admin') ||
          url.includes('/operario') ||
          url.includes('/secado-terminal')
        );
      }
    });
  }
}