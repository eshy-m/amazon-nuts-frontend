import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔥 1. Importamos ChangeDetectorRef
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
  historial: any[] = [];
  cargando = false;

  // Filtros de búsqueda
  fechaInicio: string = '';
  fechaFin: string = '';
  busqueda: string = '';

  constructor(
    private api: AsistenciaService,
    private cdr: ChangeDetectorRef // 🔥 2. Lo inyectamos en el constructor
  ) { }

  ngOnInit(): void {
    this.establecerFechasPorDefecto();
    this.buscarReportes();
  }

  // ==========================================
  // 📅 CONFIGURACIÓN DE FECHAS
  // ==========================================
  establecerFechasPorDefecto() {
    const hoy = new Date();
    const haceSieteDias = new Date();
    haceSieteDias.setDate(hoy.getDate() - 7);

    // Formateamos a YYYY-MM-DD para los inputs de tipo date
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.fechaInicio = haceSieteDias.toISOString().split('T')[0];
  }

  // ==========================================
  // 🔍 BÚSQUEDA Y PETICIÓN AL BACKEND
  // ==========================================
  buscarReportes() {
    this.cargando = true;
    this.cdr.detectChanges(); // 🔥 Forzamos la vista para mostrar "Cargando..."

    this.api.obtenerReportes(this.fechaInicio, this.fechaFin, this.busqueda).subscribe({
      next: (res) => {
        this.historial = res.data;
        this.cargando = false;
        this.cdr.detectChanges(); // 🔥 PELIZCO A ANGULAR: "Dibuja la tabla ya mismo"
      },
      error: (err) => {
        console.error('Error al cargar reportes', err);
        this.cargando = false;
        this.cdr.detectChanges(); // 🔥 Refrescamos por si hay error y se debe quitar el "Cargando..."
      }
    });
  }

  // ==========================================
  // 🧮 CÁLCULOS EN VIVO
  // ==========================================
  get totalHorasFiltradas(): number {
    return this.historial.reduce((total, asis) => total + (Number(asis.horas_trabajadas) || 0), 0);
  }
}