import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
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
  // VARIABLES DE FORMULARIO
  // ==========================================
  dniManual: string = '';
  areaSeleccionada: string = 'Selección';
  areasDisponibles: string[] = ['Selección', 'Destajo', 'Limpieza', 'Almacén'];

  registrosRecientes: any[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';

  // ==========================================
  // VARIABLES DE CONTROL DE CÁMARA
  // ==========================================
  tienePermisoCamara: boolean = false;
  camarasDisponibles: any[] = [];
  camaraActual: any = undefined; // Lo dejamos en undefined para que el navegador elija la cámara frontal/principal por defecto

  constructor(private asistenciaService: AsistenciaService) { }

  // ==========================================
  // EVENTOS DEL ESCÁNER QR
  // ==========================================

  onEscaneoExitoso(resultadoQr: string) {
    if (resultadoQr && resultadoQr.length === 8) {
      this.enviarAsistencia(resultadoQr);
    }
  }

  // Captura el error de decodificación y lo silencia para no llenar la consola de rojo
  onEscaneoError(error: any) {
    // No hacemos nada. Es normal que falle si no hay un QR frente a la cámara en este milisegundo.
  }

  onPermisoCamara(permiso: boolean) {
    this.tienePermisoCamara = permiso;
    if (!permiso) {
      this.mensajeError = "⚠️ Permiso de cámara denegado por el navegador.";
    }
  }

  onCamaraNoEncontrada() {
    this.tienePermisoCamara = false;
    this.mensajeError = "⚠️ No se detectó ninguna cámara web.";
  }

  onCamarasEncontradas(camaras: any[]) {
    this.camarasDisponibles = camaras;
    console.log("Cámaras detectadas en este dispositivo:", camaras);
    // Ya no forzamos this.camaraActual = camaras[0] para evitar la cámara negra (infrarroja) en laptops.
  }

  cambiarCamara(event: any) {
    const index = event.target.value;
    if (index !== "") {
      this.camaraActual = this.camarasDisponibles[index];
    } else {
      this.camaraActual = undefined; // Vuelve a la cámara por defecto
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

        this.registrosRecientes.unshift({
          trabajador: res.trabajador,
          estado: res.status,
          hora: res.hora,
          area: this.areaSeleccionada
        });

        setTimeout(() => this.mensajeExito = '', 4000);
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al conectar con el servidor';
        this.mensajeExito = '';
        setTimeout(() => this.mensajeError = '', 4000);
      }
    });
  }
}