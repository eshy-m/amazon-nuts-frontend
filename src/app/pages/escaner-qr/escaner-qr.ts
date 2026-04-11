import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🔥 IMPORTANTE: Necesario para el input de DNI manual
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AsistenciaService } from '../../services/asistencia';

@Component({
  selector: 'app-escaner-qr',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, FormsModule], // 🔥 Agregamos FormsModule aquí
  templateUrl: './escaner-qr.html',
  styleUrl: './escaner-qr.css'
})
export class EscanerQrComponent implements OnInit, OnDestroy {

  horaActual: Date = new Date();
  ultimoEscaneo: string = '';
  procesando: boolean = false;
  resultadoRegistro: any = null;

  dniManual: string = ''; // 🔥 Variable para almacenar lo que se tipea
  mensajeErrorCamara: string | null = null;
  private relojInterval: any;

  constructor(
    private asistenciaService: AsistenciaService,
    private cdr: ChangeDetectorRef // 🔥 Tu excelente sugerencia para mover el reloj
  ) { }

  ngOnInit() {
    // El reloj gigante se actualiza cada segundo
    this.relojInterval = setInterval(() => {
      this.horaActual = new Date();
      this.cdr.detectChanges(); // 🔥 Obligamos a la pantalla a redibujar el reloj
    }, 1000);
  }

  ngOnDestroy() {
    // Limpiamos el reloj si salimos de esta pantalla
    if (this.relojInterval) {
      clearInterval(this.relojInterval);
    }
  }

  // 🔥 NUEVA FUNCIÓN: Para el botón de "Ingresar DNI"
  registrarManual() {
    // Si está vacío, no hacemos nada
    if (!this.dniManual || this.dniManual.trim() === '') {
      return;
    }
    // Le pasamos el texto tipeado a la misma función que procesa el QR
    this.onCodeResult(this.dniManual.trim());

    // Limpiamos la caja de texto para el siguiente
    this.dniManual = '';
  }

  // Esta función ahora procesa tanto el QR de la cámara como el DNI escrito a mano
  // Esta función ahora procesa tanto el QR de la cámara como el DNI escrito a mano
  onCodeResult(resultString: string) {
    if (this.procesando || this.ultimoEscaneo === resultString) {
      return;
    }

    this.procesando = true;
    this.ultimoEscaneo = resultString;
    this.resultadoRegistro = null;
    this.cdr.detectChanges(); // Refrescamos pantalla para mostrar "Procesando"

    this.reproducirSonido('beep');

    // 🔥 Usamos registrarAsistencia (el método que tienes en tu servicio)
    this.asistenciaService.registrarAsistencia(resultString).subscribe({
      next: (res) => {
        this.resultadoRegistro = { exito: true, mensaje: res.message || 'Registro Exitoso', datos: res.data };
        this.reproducirSonido('exito');
        this.cdr.detectChanges();
        this.limpiarPantallaDespuesDeUnosSegundos();
      },
      error: (err) => {
        console.error("🚨 Error real del servidor:", err);

        // 🔥 EXTRACCIÓN SEGURA DEL ERROR (Para que no se cuelgue la pantalla)
        let mensajeError = 'Error al comunicar con el servidor';
        if (err && err.error && err.error.message) {
          mensajeError = err.error.message;
        } else if (err && err.status === 404) {
          mensajeError = 'Ruta no encontrada en Laravel';
        } else if (err && err.status === 500) {
          mensajeError = 'Error interno en Laravel';
        }

        this.resultadoRegistro = { exito: false, mensaje: mensajeError, datos: null };
        this.reproducirSonido('error');
        this.cdr.detectChanges();

        // ¡Ahora siempre llegará aquí y quitará el "Cargando"!
        this.limpiarPantallaDespuesDeUnosSegundos();
      }
    });
  }

  limpiarPantallaDespuesDeUnosSegundos() {
    setTimeout(() => {
      this.procesando = false;
      this.ultimoEscaneo = '';
      this.resultadoRegistro = null;
      this.cdr.detectChanges(); // Refrescamos pantalla para volver a la cámara limpia
    }, 4000);
  }

  // Un pequeño truco para hacer sonar la puerta web
  reproducirSonido(tipo: 'beep' | 'exito' | 'error') {
    // Aquí puedes poner rutas a archivos .mp3 si descargas sonidos
    const audio = new Audio(`assets/sounds/${tipo}.mp3`);
    audio.play();
  }

  manejarErrorCamara(error: any) {
    console.warn("La cámara no se pudo iniciar:", error);
    this.mensajeErrorCamara = "⚠️ CÁMARA NO DISPONIBLE. Por favor, ingrese su DNI manualmente.";
    this.cdr.detectChanges();
  }

}