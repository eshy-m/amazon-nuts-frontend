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
    // Escuchar estado de red para el indicador ONLINE/OFFLINE
    window.addEventListener('online', () => { this.hayInternet = true; this.cdr.detectChanges(); });
    window.addEventListener('offline', () => { this.hayInternet = false; this.cdr.detectChanges(); });
  }

  /**
   * Obtiene el lote desde el servidor y sus pesajes
   */
  verificarLote() {
    this.cargando = true;
    this.api.getLoteActivo().subscribe({
      next: (lote: any) => {
        this.loteActivo = lote;
        this.cargando = false;

        if (lote) {
          // Cargamos pesajes y calculamos totales
          // uestra la tabla tal como es this.historialReciente = lote.pesajes || [];
          this.historialReciente = lote.pesajes.sort((a: any, b: any) => b.id - a.id);//muestra de inicio a fin
          this.calcularTodo();
        } else {
          this.historialReciente = [];
          this.totalGlobal = 0;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al obtener lote:", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Suma los pesos por categoría para los cuadros de arriba
   */
  calcularTodo() {
    this.totalGlobal = 0;
    this.totalPrimera = 0;
    this.totalPartida = 0;
    this.totalOjos = 0;

    this.historialReciente.forEach(reg => {
      const peso = parseFloat(reg.peso);
      this.totalGlobal += peso;
      if (reg.categoria === 'Primera') this.totalPrimera += peso;
      if (reg.categoria === 'Partida') this.totalPartida += peso;
      if (reg.categoria === 'Ojos') this.totalOjos += peso;
    });

    if (this.totalGlobal > 0) {
      this.rendimientoPrimera = (this.totalPrimera / this.totalGlobal) * 100;
      this.porcentajeOjos = (this.totalOjos / this.totalGlobal) * 100;
    } else {
      this.rendimientoPrimera = 0;
      this.porcentajeOjos = 0;
    }
  }

  /**
   * Función principal que llaman los botones: Primera, Partida, Ojos
   */
  registrar(categoria: string) {
    if (!this.loteActivo) {
      Swal.fire('¡Atención!', 'No hay un lote activo iniciado por ingeniería.', 'warning');
      return;
    }

    Swal.fire({
      title: `Registrar ${categoria}`,
      input: 'number',
      inputLabel: 'Ingrese el peso en kilogramos',
      inputPlaceholder: '0.0',
      inputAttributes: { step: '0.1', autofocus: 'true' },
      showCancelButton: true,
      confirmButtonText: 'Guardar Pesaje',
      confirmButtonColor: '#10b981',
      preConfirm: (valor) => {
        if (!valor || valor <= 0) {
          Swal.showValidationMessage('Ingrese un peso válido mayor a 0');
        }
        return valor;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const data = {
          lote_id: this.loteActivo.id,
          categoria: categoria,
          peso: parseFloat(result.value)
        };

        this.api.registrarPesaje(data).subscribe({
          next: (res: any) => {
            // Refrescamos datos
            this.verificarLote();

            Swal.fire({
              title: '¡Guardado!',
              text: `${res.peso} kg registrados en ${categoria}`,
              icon: 'success',
              timer: 1000,
              showConfirmButton: false
            });

            // Forzamos actualización de la vista para evitar el "congelamiento"
            this.cdr.detectChanges();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
          }
        });
      }
    });
  }

  /**
   * Lógica del botón de pánico (Anular)
   */
  deshacer(id: number, index: number) {
    Swal.fire({
      title: '¿Anular Pesaje?',
      text: "Se eliminará permanentemente de los totales.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deshacerPesaje(id).subscribe({
          next: () => {
            // Eliminamos de la lista local para respuesta instantánea
            this.historialReciente.splice(index, 1);
            this.calcularTodo();
            this.cdr.detectChanges();
            Swal.fire({ title: 'Eliminado', icon: 'success', timer: 800, showConfirmButton: false });
          },
          error: (err) => {
            const msg = err.error?.error || 'No se pudo eliminar';
            Swal.fire('Error', msg, 'error');
          }
        });
      }
    });
  }

  /**
   * Verifica si un registro aún puede ser eliminado (Regla de los 5 minutos)
   */
  puedeDeshacer(reg: any, index: number): boolean {
    // Solo permitimos deshacer el último registro por seguridad
    if (index !== 0) return false;

    const ahora = new Date().getTime();
    const registroHora = new Date(reg.created_at).getTime();
    const diffMin = (ahora - registroHora) / 60000;

    return diffMin <= 5;
  }

  cerrarLote() {
    Swal.fire({
      title: '¿Finalizar Lote?',
      text: "Se cerrará la producción actual y se limpiará la pantalla.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      confirmButtonText: 'Sí, cerrar lote'
    }).then(result => {
      if (result.isConfirmed) {
        this.api.cerrarLote(this.loteActivo.id).subscribe({
          next: () => {
            this.loteActivo = null;
            this.historialReciente = [];
            this.calcularTodo();
            this.cdr.detectChanges();
            Swal.fire('Lote Finalizado', 'La jornada ha sido guardada.', 'success');
          }
        });
      }
    });
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Salir',
      cancelButtonText: 'Volver'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}