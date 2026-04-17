import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 🔥 1. CAMBIAMOS NgChartsModule POR BaseChartDirective
import { BaseChartDirective } from 'ng2-charts';
// 🔥 2. IMPORTAMOS Chart y registerables
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { AsistenciaService } from '../../services/asistencia';

// 🔥 3. REGISTRAMOS LOS GRÁFICOS (Obligatorio en las nuevas versiones)
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // 🔥 4. USAMOS BaseChartDirective EN LOS IMPORTS
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {

  // Variables para las Tarjetas Superiores
  kpis: any = {
    total_personal: 0,
    presentes_hoy: 0,
    faltas_hoy: 0,
    tardanzas_hoy: 0,
    porcentaje_asistencia: 0
  };

  // ==========================================
  // 🍩 CONFIGURACIÓN DEL GRÁFICO DE DONA (Áreas)
  // ==========================================
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    }
  };

  public pieChartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#9333ea', '#475569'],
      hoverBackgroundColor: ['#15803d', '#1d4ed8', '#b45309', '#b91c1c', '#7e22ce', '#334155']
    }]
  };
  public pieChartType: ChartType = 'doughnut';
  public chartReady = false;

  constructor(private api: AsistenciaService) { }

  ngOnInit(): void {
    this.cargarMetricasDiarias();
  }

  cargarMetricasDiarias() {
    this.api.obtenerMetricasDashboard().subscribe({
      next: (res: any) => {
        if (res.status) {
          this.kpis = res.data.kpis;

          this.pieChartData.labels = res.data.graficos.areas.labels;
          this.pieChartData.datasets[0].data = res.data.graficos.areas.data;

          this.chartReady = true;
        }
      },
      error: (err) => {
        console.error('Error al cargar el centro de control', err);
      }
    });
  }
}