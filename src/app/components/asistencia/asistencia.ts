import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner'; // 📷 Importación del escáner
import { AsistenciaService } from '../../services/asistencia';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './asistencia.html',
  styleUrls: ['./asistencia.css']
})
export class Asistencia {
  // ==========================================
  // VARIABLES DE FORMULARIO Y ESTADO
  // ==========================================
  dniManual: string = '';
  areaSeleccionada: string = 'Selección';
  areasDisponibles: string[] = ['Selección', 'Destajo', 'Limpieza', 'Almacén'];

  registrosRecientes: any[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';

  // ==========================================
  // VARIABLES DE CONTROL DE CÁMARA (Para PC)
  // ==========================================
  tienePermisoCamara: boolean = false;
  camarasDisponibles: any[] = [];
  camaraActual: any = null; // Guarda la cámara que se está usando en este momento

  constructor(private asistenciaService: AsistenciaService) { }

  // ==========================================
  // LÓGICA DE LA CÁMARA Y ESCÁNER
  // ==========================================

  // 1. Se ejecuta automáticamente cuando lee un QR válido
  onEscaneoExitoso(resultadoQr: string) {
    if (resultadoQr && resultadoQr.length === 8) {
      this.enviarAsistencia(resultadoQr);
    }
  }

  // 2. Verifica si el navegador nos dio permiso de usar la cámara
  onPermisoCamara(permiso: boolean) {
    this.tienePermisoCamara = permiso;
    if (!permiso) {
      this.mensajeError = "⚠️ El navegador bloqueó la cámara. Ve al candadito en la barra de direcciones y selecciona 'Permitir'.";
      console.error("Permiso de cámara denegado.");
    }
  }

  // 3. Se dispara si la PC no tiene ninguna cámara conectada
  onCamaraNoEncontrada() {
    this.tienePermisoCamara = false;
    this.mensajeError = "⚠️ No se detectó ninguna cámara web conectada a este dispositivo.";
    console.error("No se encontraron cámaras.");
  }

  // 4. Detecta todas las cámaras conectadas y autoselecciona la primera
  onCamarasEncontradas(camaras: any[]) {
    this.camarasDisponibles = camaras;
    console.log("Cámaras detectadas:", camaras);

    // Si encuentra cámaras, fuerza al sistema a usar la primera por defecto
    if (camaras.length > 0) {
      this.camaraActual = camaras[0];
    }
  }

  // 5. Permite al usuario cambiar de cámara manualmente desde el menú desplegable
  cambiarCamara(event: any) {
    const index = event.target.value;
    if (index !== "") {
      this.camaraActual = this.camarasDisponibles[index];
      console.log("Se cambió a la cámara:", this.camaraActual.label);
    }
  }

  // ==========================================
  // LÓGICA DE REGISTRO (API)
  // ==========================================

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

        // Agregamos el registro a la lista visible
        this.registrosRecientes.unshift({
          trabajador: res.trabajador,
          estado: res.status,
          hora: res.hora,
          area: this.areaSeleccionada
        });

        setTimeout(() => this.mensajeExito = '', 3000);
      },
      error: (err) => {
        // Mostramos el error exacto que nos envía Laravel
        this.mensajeError = err.error?.message || 'Error al conectar con el servidor';
        this.mensajeExito = '';
        setTimeout(() => this.mensajeError = '', 3000);
      }
    });
  }
}