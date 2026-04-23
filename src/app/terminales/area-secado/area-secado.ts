import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { OperacionesService } from '../../core/services/operaciones'; // Ajusta tu ruta

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
  categorias = ['Primera', 'Partida', 'Ojos'];
  procesosActivos: any[] = [];
  intervaloReloj: any;

  ngOnInit() {
    this.cargarDatos();
    // Actualizar los cronómetros cada minuto
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
        this.loteActivo = res.lote_activo;
        this.procesosActivos = res.procesos_activos;
        this.cdr.detectChanges();
      }
    });
  }

  // Verifica si una categoría específica ya está dentro del horno
  getProcesoActivo(categoria: string) {
    return this.procesosActivos.find(p => p.categoria === categoria);
  }

  // Calcula el tiempo que lleva en el horno
  calcularTiempoTranscurrido(horaInicio: string): string {
    const inicio = new Date(horaInicio).getTime();
    const ahora = new Date().getTime();
    const diffMinutos = Math.floor((ahora - inicio) / 60000);

    const horas = Math.floor(diffMinutos / 60);
    const minutos = diffMinutos % 60;
    return `${horas}h ${minutos}m`;
  }

  abrirModalInicio(categoria: string) {
    if (!this.loteActivo) {
      Swal.fire('Error', 'No hay un lote en proceso de producción.', 'error');
      return;
    }

    Swal.fire({
      title: `Ingresar ${categoria} al Horno`,
      html: `
        <div class="flex flex-col gap-3 text-left">
          <label class="text-xs font-bold text-slate-500 uppercase">Temperatura (°C)</label>
          <input id="swal-temp" type="number" class="p-3 border rounded-xl" value="55.0">
          
          <label class="text-xs font-bold text-slate-500 uppercase mt-2">Peso Húmedo Entrada (kg)</label>
          <input id="swal-peso" type="number" class="p-3 border rounded-xl" placeholder="Ej: 150.5">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Iniciar Secado',
      confirmButtonColor: '#f97316', // Orange-500
      preConfirm: () => {
        const temp = (document.getElementById('swal-temp') as HTMLInputElement).value;
        const peso = (document.getElementById('swal-peso') as HTMLInputElement).value;
        if (!temp || !peso) Swal.showValidationMessage('Ambos campos son obligatorios');
        return { temperatura_celsius: temp, peso_entrada_kg: peso };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          lote_id: this.loteActivo.id,
          categoria: categoria,
          ...result.value
        };

        this.api.iniciarSecado(payload).subscribe({
          next: () => {
            Swal.fire('¡Horno Iniciado!', `La categoría ${categoria} está secando.`, 'success');
            this.cargarDatos();
          }
        });
      }
    });
  }

  finalizarSecado(proceso: any) {
    Swal.fire({
      title: `Finalizar Secado: ${proceso.categoria}`,
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div class="bg-orange-50 p-3 rounded-xl mb-2">
            <p class="text-xs font-bold text-orange-600">Peso de Entrada: ${proceso.peso_entrada_kg} kg</p>
          </div>
          <label class="text-xs font-bold text-slate-500 uppercase">Peso Seco Salida (kg)</label>
          <input id="swal-peso-salida" type="number" class="p-3 border rounded-xl border-orange-300" placeholder="Ej: 120.0">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Registrar Salida',
      confirmButtonColor: '#10b981', // Emerald
      preConfirm: () => {
        const pesoSalida = (document.getElementById('swal-peso-salida') as HTMLInputElement).value;
        if (!pesoSalida) Swal.showValidationMessage('Ingrese el peso de salida');
        if (parseFloat(pesoSalida) > proceso.peso_entrada_kg) Swal.showValidationMessage('El peso de salida no puede ser mayor al de entrada');
        return { peso_salida_kg: pesoSalida };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.finalizarSecado(proceso.id, result.value).subscribe({
          next: () => {
            Swal.fire('¡Proceso Finalizado!', 'El peso ha sido registrado correctamente.', 'success');
            this.cargarDatos();
          }
        });
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}