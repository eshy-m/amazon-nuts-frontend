import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  mostrarLayoutPublico = true;
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe((event: any) => {
      // Solo evaluamos cuando la navegación ha terminado por completo
      if (event instanceof NavigationEnd) {
        // ESTA ES LA LÍNEA SALVAVIDAS: Si no hay redirección, toma la URL normal, o un texto vacío
        const url = event.urlAfterRedirects || event.url || '';
        this.mostrarLayoutPublico = !(url.includes('/login') || url.includes('/admin'));
      }
    });
  }
}