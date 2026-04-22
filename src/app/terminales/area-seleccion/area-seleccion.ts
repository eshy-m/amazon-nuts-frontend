import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { OperacionesService } from '../../core/services/operaciones';

@Component({
  selector: 'app-area-seleccion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-seleccion.html',
  styleUrls: ['./area-seleccion.css']
})
export class AreaSeleccionComponent implements OnInit {
  private router = inject(Router);
  private api = inject(OperacionesService);
  private cdr = inject(ChangeDetectorRef);

  loteActivo: any = null;
  cargando = true;
  hayInternet = navigator.onLine;
  historialReciente: any[] = [];

  // Totales para los Cards
  totalGlobal: number = 0;
  totalPrimera: number = 0;
  totalPartida: number = 0;
  totalOjos: number = 0;
  rendimientoPrimera: number = 0;
  porcentajeOjos: number = 0;

  ngOnInit(): void {
    this.verificarLote();
    // Escuchar estado de red
    window.addEventListener('online', () => { this.hayInternet = true; this.cdr.detectChanges(); });
    window.addEventListener('offline', () => { this.hayInternet = false; this.cdr.detectChanges(); });
  }

  verificarLote() {
    this.api.getLoteActivo().subscribe({
      next: (res: any) => {
        this.loteActivo = res.lote;
        if (res.lote && res.lote.pesajes) {
          // Ordenar: El último ID arriba
          const dataOrdenada = [...res.lote.pesajes].sort((a, b) => b.id - a.id);

          this.historialReciente = dataOrdenada.map((p: any) => ({
            id: p.id,
            categoria: p.categoria,
            peso: parseFloat(p.peso),
            created_at: p.created_at,
            hora_registro: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          }));
          this.calcularTodo();
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loteActivo = null;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  calcularTodo() {
    this.totalGlobal = 0; this.totalPrimera = 0; this.totalPartida = 0; this.totalOjos = 0;

    this.historialReciente.forEach(reg => {
      this.totalGlobal += reg.peso;
      if (reg.categoria === 'Primera') this.totalPrimera += reg.peso;
      if (reg.categoria === 'Partida') this.totalPartida += reg.peso;
      if (reg.categoria === 'Ojos') this.totalOjos += reg.peso;
    });

    if (this.totalGlobal > 0) {
      this.rendimientoPrimera = (this.totalPrimera / this.totalGlobal) * 100;
      this.porcentajeOjos = (this.totalOjos / this.totalGlobal) * 100;
    }
  }

  registrarPeso(categoria: string) {
    if (!this.loteActivo) return;
    Swal.fire({
      title: `Peso ${categoria}`,
      input: 'number',
      inputAttributes: { step: '0.1', autofocus: 'true' },
      showCancelButton: true,
      confirmButtonText: 'Guardar'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.enviarDato(categoria, parseFloat(result.value));
      }
    });
  }

  enviarDato(categoria: string, peso: number) {
    const nuevoRegistro = {
      id: Date.now(), // ID temporal para modo offline
      categoria,
      peso,
      created_at: new Date().toISOString(),
      hora_registro: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      estado: 'Pendiente' // Marca visual si está offline
    };

    // ACTUALIZACIÓN INSTANTÁNEA (Inmutabilidad)
    this.historialReciente = [nuevoRegistro, ...this.historialReciente];
    this.calcularTodo();
    this.cdr.detectChanges();

    const data = { lote_id: this.loteActivo.id, categoria, peso };
    this.api.registrarPesaje(data).subscribe({
      next: (res: any) => {
        // Actualizamos el ID temporal con el real del servidor
        this.historialReciente[0].id = res.id;
        this.historialReciente[0].estado = 'Sincronizado';
        this.cdr.detectChanges();
        Swal.fire({ title: 'OK', icon: 'success', timer: 600, showConfirmButton: false });
      },
      error: () => {
        // Si falla (offline), el dato ya está en la tabla, el operario sigue trabajando
        this.historialReciente[0].estado = 'Local';
        this.cdr.detectChanges();
      }
    });
  }

  puedeDeshacer(reg: any, index: number): boolean {
    if (index !== 0) return false;
    const ahora = new Date();
    const registroHora = new Date(reg.created_at);
    const diffMin = (ahora.getTime() - registroHora.getTime()) / 60000;
    return diffMin <= 5;
  }

  deshacer(id: number, index: number) {
    Swal.fire({
      title: '¿Anular Pesaje?',
      text: "Se eliminará del sistema y de los totales.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deshacerPesaje(id).subscribe({
          next: () => {
            this.historialReciente = this.historialReciente.filter((_, i) => i !== index);
            this.calcularTodo();
            this.cdr.detectChanges();
            Swal.fire('Eliminado', '', 'success');
          }
        });
      }
    });
  }

  cerrarLote() {
    Swal.fire({
      title: '¿Cerrar Lote?',
      text: "Esta acción finalizará la producción actual.",
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.loteActivo = null;
        this.historialReciente = [];
        this.calcularTodo();
        this.cdr.detectChanges();
        Swal.fire('Lote Cerrado', '', 'success');
      }
    });
  }
  /**
   * BOTÓN SALIR (Sesión)
   */
  logout() {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Salir',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        this.router.navigate(['/login']);
      }
    });
  }
}