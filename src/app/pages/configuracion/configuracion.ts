import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html'
})
export class ConfiguracionComponent implements OnInit {

  cargos: any[] = [];
  areas: any[] = [];

  nuevoCargo = { nombre: '', descripcion: '' };
  nuevaArea = { nombre: '', descripcion: '' };

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarCargos();
    this.cargarAreas();
  }

  // --- LÓGICA DE CARGOS ---
  cargarCargos() {
    this.http.get(`${this.apiUrl}/maestros/cargos`).subscribe((res: any) => {
      if (res.status) this.cargos = res.data;
    });
  }

  guardarCargo() {
    if (!this.nuevoCargo.nombre.trim()) return;
    this.http.post(`${this.apiUrl}/maestros/cargos`, this.nuevoCargo).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.nuevoCargo = { nombre: '', descripcion: '' }; // Limpiar formulario
          this.cargarCargos(); // Recargar lista
        }
      },
      error: (err) => alert('Error al guardar. Verifica que el nombre no esté repetido.')
    });
  }

  // --- LÓGICA DE ÁREAS ---
  cargarAreas() {
    this.http.get(`${this.apiUrl}/maestros/areas`).subscribe((res: any) => {
      if (res.status) this.areas = res.data;
    });
  }

  guardarArea() {
    if (!this.nuevaArea.nombre.trim()) return;
    this.http.post(`${this.apiUrl}/maestros/areas`, this.nuevaArea).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.nuevaArea = { nombre: '', descripcion: '' };
          this.cargarAreas();
        }
      },
      error: (err) => alert('Error al guardar. Verifica que el nombre no esté repetido.')
    });
  }
}