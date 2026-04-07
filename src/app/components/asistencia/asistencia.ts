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
  scannerHabilitado = false;
  procesando = false; // Evita que lea 10 veces el mismo QR por segundo

  // Variables para la Ventana Flotante (Modal)
  mostrarModal = false;
  esError = false;
  mensajeModal = '';
  datosTrabajador: any = null;

  constructor(private asistenciaService: AsistenciaService) { }

  activarEscaner() {
    this.scannerHabilitado = true;
  }

  finalizarControl() {
    this.scannerHabilitado = false;
  }

  onEscaneoExitoso(resultadoQr: string) {
    // Si ya está procesando un QR o mostrando la ventana, ignorar lecturas nuevas
    if (this.procesando) return;

    this.procesando = true;

    this.asistenciaService.registrarAsistencia(resultadoQr).subscribe({
      next: (res) => {
        this.reproducirSonido('exito');
        this.abrirVentanaFlotante(false, res.message, res.data);
      },
      error: (err) => {
        this.reproducirSonido('error');
        this.abrirVentanaFlotante(true, err.error.message || 'Error de lectura');
      }
    });
  }

  reproducirSonido(tipo: 'exito' | 'error') {
    // Busca los audios en la carpeta assets
    const audio = new Audio(`assets/sounds/${tipo}.mp3`);
    audio.play().catch(e => console.error('Error reproduciendo audio:', e));
  }

  abrirVentanaFlotante(esError: boolean, mensaje: string, datos: any = null) {
    this.esError = esError;
    this.mensajeModal = mensaje;
    this.datosTrabajador = datos;
    this.mostrarModal = true;

    // Temporizador: Cierra el modal después de 2 segundos exactos (2000 ms)
    setTimeout(() => {
      this.mostrarModal = false;
      this.procesando = false; // Permite volver a escanear otro fotocheck
    }, 2000);
  }
}