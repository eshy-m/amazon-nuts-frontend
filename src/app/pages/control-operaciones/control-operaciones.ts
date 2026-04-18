import { Component, OnInit } from '@angular/core';
import { OperacionesService } from '../../services/operaciones';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-control-operaciones',
  templateUrl: './control-operaciones.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ControlOperacionesComponent implements OnInit {

  // Variables de Estado
  loteActivo: any = null;
  metricas: any = {
    kpis: {
      total_primera: 0,
      total_partida: 0,
      total_ojos: 0,
      total_procesado: 0,
      porcentaje_partida_global: 0,
      porcentaje_partida_muestreo: 0, // Nueva métrica para el test
      porcentaje_avance: 0
    },
    historial_muestreos: []
  };
  cargando: boolean = true;

  // Modelos para Formularios
  nuevoLote = { cantidad_sacos: 94, peso_por_saco: 52 };
  muestreo = {
    peso_muestra: 8,
    peso_entera: 0,
    peso_partida: 0,
    peso_ojos: 0,
    peso_podrido: 0
  };

  constructor(private api: OperacionesService) { }

  ngOnInit(): void {
    this.verificarEstado();
    // Opcional: Refresco automático cada 30 segundos para ver lo que hacen los operarios
    setInterval(() => {
      if (this.loteActivo) this.obtenerMetricas();
    }, 30000);
  }

  /**
   * Verifica si hay un lote en proceso al cargar la página
   */
  verificarEstado() {
    this.api.getLoteActivo().subscribe({
      next: (res: any) => {
        this.loteActivo = res.lote;
        if (this.loteActivo) {
          this.obtenerMetricas();
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al verificar estado", err);
        this.cargando = false;
      }
    });
  }

  /**
   * Crea un nuevo lote de producción
   */
  /**
    * Crea un nuevo lote de producción
    */
  abrirLote(): void {
    if (this.nuevoLote.cantidad_sacos <= 0) {
      // Lanzamos la alerta
      Swal.fire('Error', 'Ingrese una cantidad válida de sacos', 'error');
      // Detenemos la ejecución devolviendo nada (void)
      return;
    }

    this.api.iniciarLote(this.nuevoLote).subscribe({
      next: (res: any) => {
        this.loteActivo = res.lote;
        this.obtenerMetricas();
        Swal.fire({
          title: 'Lote Iniciado',
          text: 'Proceda con el muestreo de calibración.',
          icon: 'success',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  /**
   * Registra el test de 2 minutos del Ingeniero
   */
  registrarMuestreo() {
    // Validamos que el lote exista
    if (!this.loteActivo) return;

    const data = { ...this.muestreo, lote_id: this.loteActivo.id };

    this.api.registrarMuestreo(data).subscribe({
      next: (res: any) => {
        // Al guardar, refrescamos métricas inmediatamente para ver el cambio de alerta
        this.obtenerMetricas();

        Swal.fire({
          title: 'Muestreo Registrado',
          text: res.alerta ? '¡ALERTA! El nivel de partida es muy alto.' : 'Nivel de partida aceptable.',
          icon: res.alerta ? 'warning' : 'success',
          confirmButtonColor: res.alerta ? '#dc2626' : '#10b981'
        });

        // Limpiamos solo los campos de peso, manteniendo la muestra en 8kg por defecto
        this.muestreo.peso_entera = 0;
        this.muestreo.peso_partida = 0;
        this.muestreo.peso_ojos = 0;
        this.muestreo.peso_podrido = 0;
      }
    });
  }

  /**
   * Obtiene los cálculos matemáticos desde el backend
   */
  obtenerMetricas() {
    this.api.getMetricas(this.loteActivo.id).subscribe((res: any) => {
      this.metricas = res; // <--- Aquí 'res' ya traerá 'historial_muestreos' desde el PHP
    });
  }
}