import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AsistenciaService } from '../../core/services/asistencia';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './asistencia.html',
  styleUrls: ['./asistencia.css']
})
export class Asistencia implements OnInit {
  // ==========================================
  // 📊 VARIABLES DE DATOS
  // ==========================================
  listaHoy: any[] = [];

  // ==========================================
  // 📷 VARIABLES DEL ESCÁNER Y MODAL
  // ==========================================
  mostrarModalScanner = false;
  scannerHabilitado = false;
  mostrarModalManual = false;
  procesando = false;
  codigoManual: string = '';

  camarasDisponibles: MediaDeviceInfo[] = [];
  dispositivoActual: MediaDeviceInfo | undefined;

  // ==========================================
  // 🪟 VARIABLES DE RESPUESTA (ÉXITO/ERROR)
  // ==========================================
  mostrarModalRespuesta = false;
  esError = false;
  mensajeModal = '';
  datosTrabajador: any = null; // Aquí guardaremos el objeto 'data' del backend

  constructor(
    private asistenciaService: AsistenciaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarAsistenciasHoy();
  }

  // ==========================================
  // 📥 1. CARGAR LISTADO DE HOY
  // ==========================================
  cargarAsistenciasHoy() {
    this.asistenciaService.obtenerAsistenciasHoy().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.listaHoy = res.data;
        }
      },
      error: (err) => console.error('Error al cargar asistencias:', err)
    });
  }

  // ==========================================
  // ✍️ 2. REGISTRO MANUAL (DNI/ID) - CORREGIDO
  // ==========================================
  registrarManual() {
    if (!this.codigoManual || this.procesando) return;

    this.procesando = true;
    this.asistenciaService.registrarAsistencia(this.codigoManual).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          // IMPORTANTE: Pasamos 'res.data' que contiene la asistencia + trabajador
          this.abrirModalRespuesta(false, res.message, res.data);
          this.cargarAsistenciasHoy();
          this.codigoManual = '';
          this.mostrarModalManual = false;
        } else {
          // Caso de "Acceso Denegado" o "Ya registró" que vienen con status error/warning
          this.abrirModalRespuesta(true, res.message, res.data);
        }
      },
      error: (err) => {
        this.abrirModalRespuesta(true, err.error?.message || 'Error en el servidor');
      },
      complete: () => {
        this.procesando = false;
      }
    });
  }

  // ==========================================
  // 📷 3. LÓGICA DEL ESCÁNER QR
  // ==========================================
  onCodeResult(resultString: string) {
    if (this.procesando) return;

    this.procesando = true;
    this.asistenciaService.registrarAsistencia(resultString).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.abrirModalRespuesta(false, res.message, res.data);
          this.cargarAsistenciasHoy();
          this.cerrarScanner();
        } else {
          this.abrirModalRespuesta(true, res.message, res.data);
        }
      },
      error: (err) => {
        this.abrirModalRespuesta(true, err.error?.message || 'Error al leer QR');
      },
      complete: () => {
        this.procesando = false;
      }
    });
  }

  // ==========================================
  // 🖥️ 4. GESTIÓN DE CÁMARAS
  // ==========================================
  camerasFound(devices: MediaDeviceInfo[]) {
    this.camarasDisponibles = devices;
    if (devices.length > 0) {
      this.dispositivoActual = devices[0];
    }
  }

  abrirScanner() {
    this.mostrarModalScanner = true;
    setTimeout(() => { this.scannerHabilitado = true; }, 300);
  }

  cerrarScanner() {
    this.scannerHabilitado = false;
    this.mostrarModalScanner = false;
  }
  // ==========================================
  // 🔊 REPRODUCIR SONIDO (Tus archivos MP3)
  // ==========================================
  reproducirSonido(esError: boolean) {
    // Si es error busca 'error.mp3', si no, busca 'success.mp3'
    const tipo = esError ? 'error' : 'exito';

    try {
      const audio = new Audio(`assets/sounds/${tipo}.mp3`);
      // El .catch evita que la consola arroje error rojo si el navegador bloquea el autoplay
      audio.play().catch(err => console.warn("Reproducción de audio evitada por el navegador:", err));
    } catch (e) {
      console.error("No se encontró el archivo de sonido", e);
    }
  }
  // ==========================================
  // 🔔 5. MODAL DE RESPUESTA (ÉXITO/ERROR)
  // ==========================================
  abrirModalRespuesta(esError: boolean, mensaje: string, datos: any = null) {
    this.esError = esError;
    this.mensajeModal = mensaje;
    this.datosTrabajador = datos; // Guardamos el objeto completo para el HTML
    this.reproducirSonido(esError);
    this.mostrarModalRespuesta = true;
    this.cdr.detectChanges();

    // Auto-cierre del modal tras 4 segundos
    setTimeout(() => {
      this.mostrarModalRespuesta = false;
      this.datosTrabajador = null;
      this.procesando = false; // Liberamos el escáner si estaba bloqueado
      this.cdr.detectChanges();
    }, 4000);
  }

  // ==========================================
  // 🕒 UTILIDADES DE FORMATO
  // ==========================================
  formatoHoras(horasDecimal: number | string | null): string {
    if (!horasDecimal || horasDecimal === '') return '--';
    const total = Math.abs(Number(horasDecimal));
    if (isNaN(total)) return '--';

    const horas = Math.floor(total);
    const minutos = Math.round((total - horas) * 60);
    return `${horas}h ${minutos}m`;
  }
}
