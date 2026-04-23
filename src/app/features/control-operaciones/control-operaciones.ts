import { Component, OnInit, OnDestroy } from '@angular/core';
import { OperacionesService } from '../../core/services/operaciones';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-control-operaciones',
  templateUrl: './control-operaciones.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ControlOperacionesComponent implements OnInit, OnDestroy {

  // Variables de Estado
  loteActivo: any = null;
  metricas: any = {
    kpis: {
      total_primera: 0,
      total_partida: 0,
      total_ojos: 0,
      total_procesado: 0,
      rendimiento_barrica: 0,
      meta_entera_kg: 0,
      progreso_entera_porcentaje: 0,
      porcentaje_partida_muestreo: 0,
      porcentaje_avance: 0,
      alerta_partida: false
    },
    historial_muestreos: [],
    historial_seleccion: []
  };

  cargando: boolean = true;
  pollingTimer: any; // Para el tiempo real

  // Modelos para Formularios
  nuevoLote = { cantidad_sacos: 95, peso_por_saco: 52 };
  muestreo = {
    peso_muestra: 8,
    peso_entera: 0,
    peso_partida: 0,
    peso_ojos: 0,
    peso_podrido: 0,
    peso_reproceso: 0,
    observaciones: ''
  };

  constructor(private api: OperacionesService) { }

  ngOnInit(): void {
    this.obtenerMetricas();
    // 🚀 POLLING: Actualizar automáticamente cada 15 segundos
    this.pollingTimer = setInterval(() => {
      this.obtenerMetricas(false); // false para no mostrar el spinner de carga cada vez
    }, 15000);
  }

  ngOnDestroy(): void {
    // Limpiar el timer al salir de la pantalla para no gastar recursos
    if (this.pollingTimer) clearInterval(this.pollingTimer);
  }

  obtenerMetricas(mostrarCargando = true) {
    if (mostrarCargando) this.cargando = true;

    this.api.getMetricas().subscribe({
      next: (res: any) => {
        if (res.lote_activo) {
          this.loteActivo = res.lote_activo;
          this.metricas = res;
        } else {
          this.loteActivo = null;
        }
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  iniciarNuevoLote() {
    Swal.fire({
      title: '¿Iniciar Lote de Producción?',
      text: `Se registrarán ${this.nuevoLote.cantidad_sacos} sacos para hoy.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sí, iniciar'
    }).then(result => {
      if (result.isConfirmed) {
        this.api.iniciarLote(this.nuevoLote).subscribe(() => {
          this.obtenerMetricas();
          Swal.fire('Lote Iniciado', 'Castaña lista para selección.', 'success');
        });
      }
    });
  }

  registrarMuestreo() {
    if (!this.loteActivo) return;

    const data = { ...this.muestreo, lote_id: this.loteActivo.id };

    this.api.registrarMuestreo(data).subscribe({
      next: (res: any) => {
        this.obtenerMetricas(false);
        Swal.fire({
          title: 'Muestreo Guardado',
          text: res.alerta ? '¡ALERTA! Exceso de partida detectado (>13%)' : 'Calidad aceptable.',
          icon: res.alerta ? 'warning' : 'success',
          confirmButtonColor: res.alerta ? '#e11d48' : '#10b981'
        });
        // Reset campos de peso
        this.muestreo.peso_entera = 0;
        this.muestreo.peso_partida = 0;
        this.muestreo.peso_ojos = 0;
        this.muestreo.peso_podrido = 0;
        this.muestreo.peso_reproceso = 0;
      }
    });
  }

  cerrarLote() {
    Swal.fire({
      title: '¿Finalizar Lote Actual?',
      text: 'Esta acción cerrará la jornada y no se podrán registrar más pesajes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'Sí, Cerrar Lote'
    }).then(result => {
      if (result.isConfirmed) {
        this.api.cerrarLote(this.loteActivo.id).subscribe(() => {
          this.obtenerMetricas();
          Swal.fire('Lote Finalizado', 'La jornada ha sido guardada en el historial.', 'success');
        });
      }
    });
  }
  /**
   * ESTA ES LA FUNCIÓN QUE FALTA PARA QUE LOS BOTONES FUNCIONEN
   */


}