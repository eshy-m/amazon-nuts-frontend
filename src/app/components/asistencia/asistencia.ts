import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para el [(ngModel)]
import { ZXingScannerModule } from '@zxing/ngx-scanner'; // 📷 El escáner va aquí
import { AsistenciaService } from '../../services/asistencia';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  // 👇 Importamos las herramientas directo a este componente
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './asistencia.html',
  styleUrls: ['./asistencia.css']
})
export class Asistencia {
  dniManual: string = '';
  areaSeleccionada: string = 'Selección';
  areasDisponibles: string[] = ['Selección', 'Destajo', 'Limpieza', 'Almacén'];

  registrosRecientes: any[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(private asistenciaService: AsistenciaService) { }

  onEscaneoExitoso(resultadoQr: string) {
    if (resultadoQr && resultadoQr.length === 8) {
      this.enviarAsistencia(resultadoQr);
    }
  }

  registrarManual() {
    if (this.dniManual.trim().length === 8) {
      this.enviarAsistencia(this.dniManual);
      this.dniManual = '';
    } else {
      this.mensajeError = 'El DNI debe tener 8 dígitos.';
      setTimeout(() => this.mensajeError = '', 3000);
    }
  }

  private enviarAsistencia(dni: string) {
    this.asistenciaService.registrarAsistencia(dni, this.areaSeleccionada).subscribe({
      next: (res) => {
        this.mensajeExito = `${res.trabajador}: ${res.message} (${res.hora})`;
        this.mensajeError = '';

        this.registrosRecientes.unshift({
          trabajador: res.trabajador,
          estado: res.status,
          hora: res.hora,
          area: this.areaSeleccionada
        });

        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err) => {
        this.mensajeError = err.error.message || 'Error al registrar asistencia';
        this.mensajeExito = '';
        setTimeout(() => this.mensajeError = '', 3000);
      }
    });
  }
}