import { Component, ChangeDetectorRef } from '@angular/core';
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
  scannerHabilitado = false;
  procesando = false;

  // 🟢 NUEVAS VARIABLES PARA MANEJAR MÚLTIPLES CÁMARAS
  camarasDisponibles: MediaDeviceInfo[] = [];
  dispositivoActual: MediaDeviceInfo | undefined;

  mostrarModal = false;
  esError = false;
  mensajeModal = '';
  datosTrabajador: any = null;

  constructor(
    private asistenciaService: AsistenciaService,
    private cdr: ChangeDetectorRef
  ) { }

  activarEscaner() {
    this.scannerHabilitado = true;
  }

  finalizarControl() {
    this.scannerHabilitado = false;
    this.dispositivoActual = undefined;
  }

  // 🟢 GUARDAMOS TODAS LAS CÁMARAS
  onCamarasEncontradas(camaras: MediaDeviceInfo[]) {
    console.log("Cámaras encontradas:", camaras);
    this.camarasDisponibles = camaras;
    if (camaras && camaras.length > 0) {
      this.dispositivoActual = camaras[0]; // Intenta con la primera por defecto
      this.cdr.detectChanges();
    }
  }

  // 🟢 FUNCIÓN PARA CAMBIAR DE CÁMARA DESDE EL HTML
  cambiarCamara(event: any) {
    const deviceId = event.target.value;
    this.dispositivoActual = this.camarasDisponibles.find(c => c.deviceId === deviceId);
    this.cdr.detectChanges();
  }

  onPermisoRespuesta(permiso: boolean) {
    console.log("¿Permiso de cámara concedido?:", permiso);
    if (!permiso) {
      alert("El navegador bloqueó la cámara. Verifica los permisos en la barra de direcciones.");
    }
  }

  onEscaneoExitoso(resultadoQr: string) {
    if (this.procesando) return;

    this.procesando = true;
    this.cdr.detectChanges();

    console.log("Enviando QR al servidor:", resultadoQr);

    this.asistenciaService.registrarAsistencia(resultadoQr).subscribe({
      next: (res) => {
        console.log("Respuesta Exitosa de Laravel:", res);
        this.reproducirSonido('exito');
        this.abrirVentanaFlotante(false, res.message, res.data);
      },
      error: (err) => {
        console.error("Error devuelto por Laravel:", err);
        this.reproducirSonido('error');

        const mensajeError = err?.error?.message || err?.message || 'Error de comunicación con el servidor';
        this.abrirVentanaFlotante(true, mensajeError);
      }
    });
  }

  reproducirSonido(tipo: 'exito' | 'error') {
    const audio = new Audio(`assets/sounds/${tipo}.mp3`);
    audio.play().catch(e => console.error('Error reproduciendo audio:', e));
  }

  abrirVentanaFlotante(esError: boolean, mensaje: string, datos: any = null) {
    this.esError = esError;
    this.mensajeModal = mensaje;
    this.datosTrabajador = datos;
    this.mostrarModal = true;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.mostrarModal = false;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.procesando = false;
      }, 1500);

    }, 2000);
  }
}