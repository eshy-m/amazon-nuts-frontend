import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { AsistenciaService } from '../../core/services/asistencia';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {

  kpis: any = {
    total_personal: 0,
    presentes_hoy: 0,
    faltas_hoy: 0,
    tardanzas_hoy: 0,
    porcentaje_asistencia: 0
  };

  // 👇 Nueva variable para mostrar los últimos movimientos
  ultimosRegistros: any[] = [];
  cargandoRegistros = true;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
    }
  };

  public pieChartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#9333ea', '#475569'],
    }]
  };

  public pieChartType: ChartType = 'doughnut';
  public chartReady = false;

  constructor(private api: AsistenciaService) { }

  ngOnInit(): void {
    this.cargarMetricasDiarias();
    this.cargarActividadReciente(); // 🔥 Nueva función
  }

  cargarMetricasDiarias() {
    this.api.obtenerMetricasDashboard().subscribe({
      next: (res: any) => {
        this.kpis = res;
        if (res.por_area) {
          this.pieChartData.labels = res.por_area.map((a: any) => a.area);
          this.pieChartData.datasets[0].data = res.por_area.map((a: any) => a.cantidad);
          this.chartReady = true;
        }
      }
    });
  }

  // 🔥 Carga los últimos 5-10 registros para el feed de actividad
  cargarActividadReciente() {
    this.api.obtenerAsistenciasHoy().subscribe({
      next: (res: any) => {
        // Tomamos solo los primeros 6 para no saturar el dashboard
        this.ultimosRegistros = res.data.slice(0, 6);
        this.cargandoRegistros = false;
      },
      error: () => this.cargandoRegistros = false
    });
  }
}