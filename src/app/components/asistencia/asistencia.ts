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

  mostrarModal = false;
  esError = false;
  mensajeModal = '';
  datosTrabajador: any = null;

  constructor(
    private asistenciaService: AsistenciaService,
    private cdr: ChangeDetectorRef // 🟢 IMPORTANTE: Inyectamos el actualizador de pantalla
  ) { }

  activarEscaner() {
    this.scannerHabilitado = true;
  }

  finalizarControl() {
    this.scannerHabilitado = false;
  }

  onEscaneoExitoso(resultadoQr: string) {
    // Si ya estamos procesando un código, ignoramos cualquier otra lectura de la cámara
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

        // 🟢 MEJORA: Capturamos el mensaje de error exacto de Laravel
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

    // 🟢 FORZAMOS A ANGULAR A MOSTRAR LA VENTANA
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mostrarModal = false;
      // 🟢 FORZAMOS A ANGULAR A OCULTAR LA VENTANA
      this.cdr.detectChanges();

      // 🟢 MEJORA: Damos 1.5 segundos extras "de gracia" antes de desbloquear el escáner
      // Esto evita que lea el mismo QR apenas desaparece la ventana si el trabajador no ha retirado el fotocheck
      setTimeout(() => {
        this.procesando = false;
      }, 1500);

    }, 2000); // La ventana dura 2 segundos
  }
}