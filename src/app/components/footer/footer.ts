import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // <-- 1. IMPORTAR ESTO

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink], // <-- 2. AGREGARLO A LOS IMPORTS
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  // Obtenemos el año actual automáticamente
  anioActual = new Date().getFullYear();
}