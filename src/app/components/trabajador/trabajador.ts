import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Variables de entorno y servicio
import { environment } from '../../../environments/environment';
import { TrabajadorService } from '../../services/trabajador';

@Component({
  selector: 'app-trabajador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trabajador.html',
  styleUrls: ['./trabajador.css']
})
export class TrabajadorComponent implements OnInit {

  // URL base para los QRs (viene de los environments)
  public baseStorageUrl: string = environment.storageUrl;

  // 📊 Variables para la Vista (Dashboard)
  public lista: any[] = [];
  public estadisticas: any[] = [];
  public totalPersonal: number = 0;

  // 🪟 Control de Ventanas Modales
  public mostrarModalForm = false;
  public mostrarModalFotocheck = false;
  public trabajadorSeleccionado: any = null;
  public esEdicion = false; // Define si el modal es para Crear o Editar

  // Objeto del formulario (Con todos los campos nuevos)
  public form: any = this.obtenerFormularioVacio();

  constructor(
    private api: TrabajadorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // 🔄 Carga principal de datos (Lista + Estadísticas)
  cargarDatos(): void {
    this.obtenerTrabajadores();
    this.obtenerEstadisticas();
  }

  // 📋 Obtener la lista
  obtenerTrabajadores(): void {
    this.api.listar().subscribe({
      next: (res: any) => {
        this.lista = res.data ? res.data : res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al obtener los trabajadores:', err)
    });
  }

  // 📊 Obtener Estadísticas
  obtenerEstadisticas(): void {
    if (this.api.getEstadisticas) {
      this.api.getEstadisticas().subscribe({
        next: (res: any) => {
          this.estadisticas = res.data.por_area;
          this.totalPersonal = res.data.total;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al cargar estadísticas:', err)
      });
    }
  }

  // ---------------------------------------------------
  // 🪟 CONTROL DE MODALES Y ACCIONES CRUD
  // ---------------------------------------------------

  // ➕ Abre modal para NUEVO
  abrirModalNuevo(): void {
    this.esEdicion = false;
    this.form = this.obtenerFormularioVacio();
    this.mostrarModalForm = true;
  }

  // ✏️ Abre modal para EDITAR
  editarTrabajador(t: any): void {
    this.esEdicion = true;
    this.form = { ...t }; // Copia los datos para no afectar la tabla directamente
    this.mostrarModalForm = true;
  }

  // 🗑️ Acción de ELIMINAR
  eliminarTrabajador(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar a este trabajador? Esta acción no se puede deshacer.')) {
      this.api.eliminar(id).subscribe({
        next: () => {
          alert('Trabajador eliminado correctamente.');
          this.cargarDatos(); // Recargar datos
        },
        error: () => alert('Error al eliminar el trabajador.')
      });
    }
  }

  // Cierra el modal de formulario
  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  // Abre el modal de FOTOCHECK
  verFotocheck(trabajador: any): void {
    this.trabajadorSeleccionado = trabajador;
    this.mostrarModalFotocheck = true;
  }

  cerrarModalFotocheck(): void {
    this.mostrarModalFotocheck = false;
    this.trabajadorSeleccionado = null;
  }

  // 💾 Función GUARDAR (Sirve para Crear y Actualizar)
  guardar(): void {
    if (!this.form.dni || this.form.dni.toString().length !== 8) {
      alert('El DNI debe tener exactamente 8 dígitos.');
      return;
    }
    if (!this.form.area || !this.form.genero) {
      alert('Por favor, completa los campos obligatorios (Área, Género, Nombres, Apellidos).');
      return;
    }

    if (this.esEdicion) {
      // PROCESO DE ACTUALIZAR
      this.api.actualizar(this.form.id, this.form).subscribe({
        next: () => {
          alert('¡Trabajador actualizado con éxito!');
          this.cerrarModalForm();
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar. Verifica que el DNI no esté duplicado.');
        }
      });
    } else {
      // PROCESO DE CREAR
      this.api.registrar(this.form).subscribe({
        next: () => {
          alert('¡Trabajador registrado y QR generado con éxito!');
          this.cerrarModalForm();
          this.cargarDatos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al registrar. Verifica que el DNI no esté duplicado.');
        }
      });
    }
  }

  // 🖨️ Imprimir
  imprimirFotocheck(): void {
    window.print();
  }

  // 🧹 Formulario Vacío con los campos nuevos
  private obtenerFormularioVacio(): any {
    return {
      nombres: '',
      apellidos: '',
      dni: '',
      genero: '',
      area: '',
      celular: '',
      direccion: '',
      experiencia: false,
      observaciones: '',
      fecha_inicio: ''
    };
  }
}