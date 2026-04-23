import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { OperacionesService } from '../../core/services/operaciones';

@Component({
  selector: 'app-area-secado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-secado.html'
})
export class AreaSecado implements OnInit, OnDestroy {
  private router = inject(Router);
  private api = inject(OperacionesService);
  private cdr = inject(ChangeDetectorRef);

  loteActivo: any = null;
  procesosActivos: any[] = [];
  stockDisponible: any = { Primera: 0, Partida: 0, Ojos: 0 };
  intervaloReloj: any;

  ngOnInit() {
    // 🔴 ESTA LÍNEA CORRIGE EL ERROR: Carga los datos de inmediato
    this.cargarDatos();

    // Actualizar cronómetros cada minuto
    this.intervaloReloj = setInterval(() => {
      this.cdr.detectChanges();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.intervaloReloj) clearInterval(this.intervaloReloj);
  }

  cargarDatos() {
    this.api.getProcesosSecado().subscribe({
      next: (res: any) => {
        this.loteActivo = res.lote;
        this.procesosActivos = res.procesos_activos || [];
        this.stockDisponible = res.stock_disponible || { Primera: 0, Partida: 0, Ojos: 0 };
        this.cdr.detectChanges();
      },
      error: () => {
        console.error("Error al conectar con el servidor");
      }
    });
  }

  iniciarSecadoRapido(categoria: string) {
    const peso = this.stockDisponible[categoria];

    Swal.fire({
      title: `Iniciar Horno: ${categoria}`,
      html: `
        <div class="text-left mt-4">
          <label class="text-xs font-bold text-slate-400 uppercase">Peso a ingresar (kg)</label>
          <input type="number" id="swal-peso" class="swal2-input" value="${peso.toFixed(2)}">
          
          <label class="text-xs font-bold text-slate-400 uppercase mt-4 block">Temperatura del Horno (°C)</label>
          <input type="number" id="swal-temp" class="swal2-input" value="60">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Encender Horno',
      confirmButtonColor: '#ea580c',
      preConfirm: () => {
        const pesoIngresado = (document.getElementById('swal-peso') as HTMLInputElement).value;
        const tempIngresada = (document.getElementById('swal-temp') as HTMLInputElement).value;
        if (!pesoIngresado || !tempIngresada) {
          Swal.showValidationMessage('Por favor completa todos los campos');
        }
        return {
          peso_entrada_kg: parseFloat(pesoIngresado),
          temperatura_celsius: parseFloat(tempIngresada)
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const data = {
          lote_id: this.loteActivo.id,
          categoria: categoria,
          temperatura_celsius: result.value.temperatura_celsius,
          peso_entrada_kg: result.value.peso_entrada_kg
        };

        this.api.iniciarSecado(data).subscribe(() => {
          Swal.fire('Horno Encendido', 'El proceso ha comenzado', 'success');
          this.cargarDatos();
        });
      }
    });
  }

  finalizarSecado(proceso: any) {
    Swal.fire({
      title: 'Registrar Peso de Salida',
      html: `<input type="number" id="swal-peso-salida" class="swal2-input" placeholder="Kilos Secos">`,
      showCancelButton: true,
      confirmButtonText: 'Finalizar Secado',
      preConfirm: () => {
        const peso = (document.getElementById('swal-peso-salida') as HTMLInputElement).value;
        if (!peso) Swal.showValidationMessage('Debe ingresar el peso');
        return { peso_salida_kg: peso };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.finalizarSecado(proceso.id, result.value).subscribe(() => {
          this.cargarDatos();
          Swal.fire('Finalizado', 'Merma calculada con éxito', 'success');
        });
      }
    });
  }

  calcularTiempoTranscurrido(horaInicio: string): string {
    const inicio = new Date(horaInicio).getTime();
    const ahora = new Date().getTime();
    const diffMs = ahora - inicio;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    return `${diffHrs}h ${diffMins}m`;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}