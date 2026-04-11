import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../services/asistencia';

@Component({
  selector: 'app-reportes-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-asistencia.html'
})
export class ReportesAsistenciaComponent implements OnInit {

  // ==========================================
  // 📊 VARIABLES DE ESTADO Y DATOS
  // ==========================================
  historialCompleto: any[] = []; // Guarda TODOS los datos traídos por fecha
  historialFiltrado: any[] = []; // Guarda los datos que se muestran en la tabla según la búsqueda
  cargando = false;

  // Filtros de búsqueda
  fechaInicio: string = '';
  fechaFin: string = '';
  busqueda: string = '';

  constructor(
    private api: AsistenciaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.establecerFechasPorDefecto();
    this.cargarReportesPorFechas(); // Carga inicial
  }

  // ==========================================
  // 📅 CONFIGURACIÓN DE FECHAS
  // ==========================================
  establecerFechasPorDefecto() {
    const hoy = new Date();
    const haceSieteDias = new Date();
    haceSieteDias.setDate(hoy.getDate() - 7);

    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceSieteDias.toISOString().split('T')[0];
  }

  // ==========================================
  // 🌐 PETICIÓN AL BACKEND (Solo por Fechas)
  // ==========================================
  cargarReportesPorFechas() {
    this.cargando = true;
    this.cdr.detectChanges();

    // OJO: Ya no le enviamos la "búsqueda" de texto al backend, traemos todo el bloque de fechas
    this.api.obtenerReportes(this.fechaInicio, this.fechaFin, '').subscribe({
      next: (res) => {
        this.historialCompleto = res.data || [];
        this.filtrarEnTiempoReal(); // Aplicamos el filtro al instante por si ya había texto
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar reportes', err);
        this.historialCompleto = [];
        this.historialFiltrado = [];
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // ⚡ FILTRO INSTANTÁNEO EN EL CLIENTE (Frontend)
  // ==========================================
  filtrarEnTiempoReal() {
    // Si la barra está vacía, mostramos todo el historial de esas fechas
    if (!this.busqueda || this.busqueda.trim() === '') {
      this.historialFiltrado = [...this.historialCompleto];
      return;
    }

    const termino = this.busqueda.toLowerCase().trim();

    // Filtramos al instante buscando coincidencias en DNI, nombres, apellidos o áreas
    this.historialFiltrado = this.historialCompleto.filter(h =>
      (h.trabajador?.dni && h.trabajador.dni.includes(termino)) ||
      (h.trabajador?.nombres && h.trabajador.nombres.toLowerCase().includes(termino)) ||
      (h.trabajador?.apellidos && h.trabajador.apellidos.toLowerCase().includes(termino)) ||
      (h.turno?.area && h.turno.area.toLowerCase().includes(termino)) ||
      (h.trabajador?.area && h.trabajador.area.toLowerCase().includes(termino))
    );
  }
}