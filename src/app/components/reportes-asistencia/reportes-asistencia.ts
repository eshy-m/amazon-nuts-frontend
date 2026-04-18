import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciaService } from '../../services/asistencia';
import { environment } from '../../../environments/environment'; // 👈 Importación vital para las URLs

@Component({
  selector: 'app-reportes-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-asistencia.html'
})
export class ReportesAsistenciaComponent implements OnInit {

  // ==========================================
  // 📊 VARIABLES DE ESTADO Y DATOS.
  // ==========================================
  historialCompleto: any[] = [];
  historialFiltrado: any[] = [];
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
    this.cargarReportesPorFechas();
  }

  // ==========================================
  // 📅 CONFIGURACIÓN DE FECHAS
  // ==========================================
  establecerFechasPorDefecto() {
    const hoy = new Date();
    const haceSieteDias = new Date();
    haceSieteDias.setDate(hoy.getDate() - 7);

    this.fechaInicio = haceSieteDias.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
  }

  // ==========================================
  // 📥 FUNCIONES DE EXPORTACIÓN (PDF / EXCEL)
  // ==========================================

  /**
   * Genera el PDF tipo "Consolidado" que usa el ingeniero manualmente.
   * Se abre en una pestaña nueva para disparar la descarga.
   */
  mostrarModalExportar = false;
  tipoReporteSeleccionado: 'consolidado' | 'detallado' = 'consolidado';



  abrirModalExportar(tipo: 'consolidado' | 'detallado') {
    // Validamos primero que haya fechas seleccionadas
    if (!this.fechaInicio || !this.fechaFin) {
      alert("Por favor selecciona un rango de fechas antes de exportar.");
      return;
    }

    // Guardamos qué botón presionó y abrimos el modal
    this.tipoReporteSeleccionado = tipo;
    this.mostrarModalExportar = true;
  }

  cerrarModalExportar() {
    this.mostrarModalExportar = false;
  }

  exportar(formato: 'pdf' | 'excel') {
    let endpoint = '';

    if (this.tipoReporteSeleccionado === 'consolidado') {
      endpoint = formato === 'pdf' ? 'general/pdf' : 'general/excel';
    } else {
      endpoint = formato === 'pdf' ? 'detallado/pdf' : 'detallado/excel';
    }

    const url = `${environment.apiUrl}/reportes/${endpoint}?inicio=${this.fechaInicio}&fin=${this.fechaFin}`;
    window.open(url, '_blank');
    this.cerrarModalExportar();
  }


  descargarGeneralPDF() {
    if (!this.fechaInicio || !this.fechaFin) {
      alert("Por favor selecciona un rango de fechas.");
      return;
    }
    const url = `${environment.apiUrl}/reportes/general/pdf?inicio=${this.fechaInicio}&fin=${this.fechaFin}`;
    window.open(url, '_blank');
  }

  /**
   * Genera un Excel detallado con todos los registros y horas.
   */
  descargarDetalladoExcel() {
    if (!this.fechaInicio || !this.fechaFin) {
      alert("Por favor selecciona un rango de fechas.");
      return;
    }
    const url = `${environment.apiUrl}/reportes/detallado/excel?inicio=${this.fechaInicio}&fin=${this.fechaFin}`;
    window.open(url, '_blank');
  }

  // ==========================================
  // 🔍 CARGA Y FILTRADO DE DATOS
  // ==========================================

  cargarReportesPorFechas() {
    if (!this.fechaInicio || !this.fechaFin) return;

    this.cargando = true;
    this.api.obtenerReportes(this.fechaInicio, this.fechaFin).subscribe({
      next: (res: any) => {
        this.historialCompleto = res.data || [];
        this.filtrarEnTiempoReal();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar reportes', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarEnTiempoReal() {
    if (!this.busqueda || this.busqueda.trim() === '') {
      this.historialFiltrado = [...this.historialCompleto];
      return;
    }

    const termino = this.busqueda.toLowerCase().trim();
    this.historialFiltrado = this.historialCompleto.filter(h =>
      (h.trabajador?.dni && h.trabajador.dni.includes(termino)) ||
      (h.trabajador?.nombres && h.trabajador.nombres.toLowerCase().includes(termino)) ||
      (h.trabajador?.apellidos && h.trabajador.apellidos.toLowerCase().includes(termino)) ||
      (h.trabajador?.area && h.trabajador.area.toLowerCase().includes(termino))
    );
  }
  // ==========================================
  // 🕒 FORMATO DE HORAS (De decimal a texto)
  // ==========================================
  formatoHoras(horasDecimal: number | string | null): string {
    // 1. Si no hay datos, mostramos guiones
    if (horasDecimal === null || horasDecimal === undefined || horasDecimal === '') {
      return '--';
    }

    // 2. Convertir a número positivo
    const total = Math.abs(Number(horasDecimal));

    // 3. Si el resultado no es un número válido
    if (isNaN(total)) return '--';

    // 4. Extraer horas y minutos
    const horas = Math.floor(total);
    const minutos = Math.round((total - horas) * 60);

    // 5. Retornar el formato solicitado: "0h y 2 min"
    return `${horas}h y ${minutos} min`;
  }
}