import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class Asistencia implements OnInit {
  // ==========================================
  // 📊 VARIABLES DE DATOS
  // ==========================================
  listaHoy: any[] = []; // Almacena los registros del día actual

  // ==========================================
  // 📷 VARIABLES DEL ESCÁNER Y MODAL
  // ==========================================
  mostrarModalScanner = false;
  scannerHabilitado = false;
  mostrarModalManual = false;
  procesando = false; // Bloquea múltiples escaneos accidentales
  codigoManual: string = ''; // Modelo para el input de DNI manual

  camarasDisponibles: MediaDeviceInfo[] = [];
  dispositivoActual: MediaDeviceInfo | undefined;

  // ==========================================
  // 🪟 VARIABLES DE RESPUESTA (ÉXITO/ERROR)
  // ==========================================
  mostrarModalRespuesta = false;
  esError = false;
  mensajeModal = '';
  datosTrabajador: any = null;

  constructor(
    private api: AsistenciaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarTablaHoy();
  }

  // ==========================================
  // 🔄 MÉTODOS DE DATOS (TABLA)
  // ==========================================
  cargarTablaHoy() {
    this.api.obtenerAsistenciasHoy().subscribe({
      next: (res) => {
        this.listaHoy = res.data;
        this.cdr.detectChanges(); // Actualizamos la vista
      },
      error: (err) => console.error('Error al cargar la tabla de hoy:', err)
    });
  }

  // ==========================================
  // 🪟 CONTROL DE VENTANAS (MODALES Y CÁMARA)
  // ==========================================
  abrirScanner() {
    this.mostrarModalScanner = true;

    // Pequeño retraso para que Angular dibuje el modal antes de encender la cámara
    setTimeout(() => {
      this.scannerHabilitado = true;
      this.cdr.detectChanges();
    }, 100);
  }

  cerrarScanner() {
    // 1. Apagamos la cámara primero para liberar hardware
    this.scannerHabilitado = false;
    this.dispositivoActual = undefined;

    // 2. Esperamos a que se apague antes de ocultar el modal
    setTimeout(() => {
      this.mostrarModalScanner = false;
      this.cdr.detectChanges();
    }, 200);
  }

  // ==========================================
  // 📷 CONTROL DE DISPOSITIVOS (CÁMARAS)
  // ==========================================

  // 🔥 ACTUALIZADO: Detecta cámaras y elige AUTOMÁTICAMENTE la trasera
  onCamarasEncontradas(camaras: MediaDeviceInfo[]) {
    this.camarasDisponibles = camaras;

    if (camaras && camaras.length > 0) {
      // 🕵️‍♂️ Lógica para buscar la cámara trasera (environment / back / trasera)
      // Convertimos el label a minúsculas para una búsqueda más segura
      const camaraTrasera = camaras.find(camara =>
        camara.label.toLowerCase().includes('back') ||
        camara.label.toLowerCase().includes('environment') ||
        camara.label.toLowerCase().includes('trasera')
      );

      // Si encuentra una que coincida con la descripción trasera, la usa.
      // Sino, usa la primera disponible por defecto.
      if (camaraTrasera) {
        this.dispositivoActual = camaraTrasera;
        console.log('✅ Cámara trasera seleccionada automáticamente:', camaraTrasera.label);
      } else {
        this.dispositivoActual = camaras[0];
        console.log('⚠️ No se identificó cámara trasera explícita. Usando por defecto:', camaras[0].label);
      }
    }
  }

  // ==========================================
  // ⌨️ MÉTODOS DE REGISTRO
  // ==========================================

  registroManual() {
    // Limpieza de espacios y validación segura
    const codigoSeguro = String(this.codigoManual || '').trim();

    if (!codigoSeguro || codigoSeguro === '') {
      alert('Ingrese un DNI válido.');
      return;
    }

    // Disparamos la misma función que usa el QR
    this.onEscaneoExitoso(codigoSeguro);
    this.codigoManual = ''; // Limpiamos el input
  }

  onEscaneoExitoso(resultadoQr: string) {
    if (this.procesando) return; // Evita peticiones duplicadas

    this.procesando = true;
    this.cdr.detectChanges();

    this.api.registrarAsistencia(resultadoQr).subscribe({
      next: (res) => {
        this.reproducirSonido('exito');
        this.mostrarResultado(false, res.message, res.data);
        this.cargarTablaHoy(); // Recargamos la tabla al instante
      },
      error: (err) => {
        this.reproducirSonido('error');
        const mensajeError = err?.error?.message || 'Error de comunicación';
        this.mostrarResultado(true, mensajeError);
      }
    });
  }

  // ==========================================
  // 🔔 FEEDBACK VISUAL Y SONORO
  // ==========================================
  reproducirSonido(tipo: 'exito' | 'error') {
    const audio = new Audio(`assets/sounds/${tipo}.mp3`);
    audio.play().catch(e => console.error('Audio bloqueado por navegador:', e));
  }

  mostrarResultado(esError: boolean, mensaje: string, datos: any = null) {
    this.esError = esError;
    this.mensajeModal = mensaje;
    this.datosTrabajador = datos;

    this.mostrarModalRespuesta = true;
    this.cdr.detectChanges(); // Forzamos aparición inmediata

    // Ocultar automáticamente tras 3.5 segundos
    setTimeout(() => {
      this.mostrarModalRespuesta = false;
      this.procesando = false;
      this.cdr.detectChanges();
    }, 3500);
  }
  // ==========================================
  // 🕒 FORMATO DE HORAS (De decimal a texto)
  // ==========================================
  formatoHoras(horasDecimal: number | string | null): string {
    // Si no hay horas o viene nulo, retornamos los guiones
    if (!horasDecimal || horasDecimal === '') return '--';

    // 1. Convertimos a número y aplicamos Math.abs para quitar el negativo (-9.04 -> 9.04)
    const total = Math.abs(Number(horasDecimal));

    if (isNaN(total)) return '--';

    // 2. Extraemos las horas enteras (9)
    const horas = Math.floor(total);

    // 3. Convertimos los decimales restantes a minutos (0.04 * 60 = 2.4 -> redondeado a 2)
    const minutos = Math.round((total - horas) * 60);

    // 4. Construimos el texto amigable
    if (horas > 0 && minutos > 0) {
      return `${horas} h y ${minutos} min`;
    } else if (horas > 0) {
      return `${horas} h`;
    } else if (minutos > 0) {
      return `${minutos} min`;
    } else {
      return '--';
    }
  }
}