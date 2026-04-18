import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurnoService } from '../../services/turno';
import { MaestroService } from '../../services/maestro';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turnos.html',
  styleUrl: './turnos.css'
})
export class Turnos implements OnInit {
  // --- PROPIEDADES ---
  turnoForm: FormGroup;
  turnos: any[] = [];
  turnosAgrupados: any[] = [];

  areasMaestras: any[] = [];
  cargosMaestros: any[] = [];

  areasSeleccionadas: number[] = [];
  todasAreasSeleccionadas = false;

  vistaAgrupada: boolean = true;
  mostrarModal = false;
  modoEdicion = false;
  turnoIdSeleccionado: number | null = null;

  constructor(
    private fb: FormBuilder,
    private turnoService: TurnoService,
    private maestroService: MaestroService
  ) {
    this.turnoForm = this.fb.group({
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      hora_entrada: ['07:00', Validators.required],
      hora_salida: ['16:00', Validators.required],
      tipo_registro: ['Turno de Trabajo', Validators.required],
      tolerancia_minutos: [15, [Validators.required, Validators.min(0)]],
      es_nocturno: [false]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.inicializarMaestros();
  }

  // --- CARGA DE DATOS ---

  cargarDatos() {
    this.turnoService.getTurnos().subscribe({
      next: (res: any) => {
        this.turnos = res;
        this.agruparPorDia();
      },
      error: (err) => console.error('Error al cargar turnos:', err)
    });
  }

  inicializarMaestros() {
    this.maestroService.getAreas().subscribe({
      next: (res: any) => this.areasMaestras = res.data || res,
      error: (err) => console.error('Error al traer áreas:', err)
    });

    this.maestroService.getCargos().subscribe({
      next: (res: any) => this.cargosMaestros = res.data || res,
      error: (err) => console.error('Error al traer cargos:', err)
    });
  }

  agruparPorDia() {
    const grupos: any = {};
    this.turnos.forEach(t => {
      if (!grupos[t.fecha]) {
        const partes = t.fecha.split('-');
        const fechaObj = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
        const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };

        grupos[t.fecha] = {
          fecha: t.fecha,
          fechaBonita: fechaObj.toLocaleDateString('es-ES', opciones),
          turnos: []
        };
      }
      grupos[t.fecha].turnos.push(t);
    });
    this.turnosAgrupados = Object.values(grupos).sort((a: any, b: any) => b.fecha.localeCompare(a.fecha));
  }

  // --- LÓGICA DE SELECCIÓN ---

  toggleArea(id: number) {
    const index = this.areasSeleccionadas.indexOf(id);
    if (index > -1) {
      this.areasSeleccionadas.splice(index, 1);
      this.todasAreasSeleccionadas = false;
    } else {
      this.areasSeleccionadas.push(id);
      if (this.areasSeleccionadas.length === this.areasMaestras.length) {
        this.todasAreasSeleccionadas = true;
      }
    }
  }

  toggleTodasLasAreas() {
    this.todasAreasSeleccionadas = !this.todasAreasSeleccionadas;
    this.areasSeleccionadas = this.todasAreasSeleccionadas ? this.areasMaestras.map(a => a.id) : [];
  }

  // --- ACCIONES PRINCIPALES ---

  guardar(): void {
    if (this.turnoForm.invalid) {
      Swal.fire('Atención', 'Completa todos los campos obligatorios', 'warning');
      return;
    }

    const formulario = this.turnoForm.value;

    if (this.modoEdicion && this.turnoIdSeleccionado) {
      // EDICIÓN: Corregido para enviar 'tipo_registro' y evitar el error 1048 del Log
      const datosEdicion = {
        fecha: formulario.fecha_inicio,
        hora_entrada: formulario.hora_entrada,
        hora_salida: formulario.hora_salida,
        es_nocturno: formulario.es_nocturno ? 1 : 0,
        area_id: this.areasSeleccionadas[0],
        tipo_registro: formulario.tipo_registro || 'Turno de Trabajo',
        tolerancia_minutos: formulario.tolerancia_minutos
      };

      this.turnoService.updateTurno(this.turnoIdSeleccionado, datosEdicion).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Turno actualizado correctamente', 'success');
          this.cerrarYCargar();
        },
        error: (err) => {
          console.error("Error al editar:", err);
          Swal.fire('Error', 'No se pudo editar el turno', 'error');
        }
      });

    } else {
      // CREACIÓN: Masiva
      if (this.areasSeleccionadas.length === 0) {
        Swal.fire('Atención', 'Selecciona al menos un área', 'warning');
        return;
      }

      const datosMasivos = {
        ...formulario,
        es_nocturno: formulario.es_nocturno ? 1 : 0,
        areas_ids: this.areasSeleccionadas,
        cargos_ids: this.cargosMaestros.map(c => c.id) // Enviamos todos los cargos
      };

      this.turnoService.crearTurno(datosMasivos).subscribe({
        next: () => {
          Swal.fire('¡Registrado!', 'La planificación se generó con éxito', 'success');
          this.cerrarYCargar();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          Swal.fire('Error', 'Hubo un fallo al registrar los turnos', 'error');
        }
      });
    }
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.turnoIdSeleccionado = null;
    this.turnoForm.reset({
      hora_entrada: '07:00',
      hora_salida: '16:00',
      tipo_registro: 'Turno de Trabajo',
      tolerancia_minutos: 15,
      es_nocturno: false
    });
    this.areasSeleccionadas = [];
    this.todasAreasSeleccionadas = false;
    this.mostrarModal = true;
  }

  abrirEditar(turno: any) {
    this.modoEdicion = true;
    this.turnoIdSeleccionado = turno.id;
    this.mostrarModal = true;

    this.turnoForm.patchValue({
      fecha_inicio: turno.fecha,
      fecha_fin: turno.fecha,
      hora_entrada: turno.hora_entrada,
      hora_salida: turno.hora_salida,
      tipo_registro: turno.tipo_registro,
      tolerancia_minutos: turno.tolerancia_minutos,
      es_nocturno: turno.es_nocturno === 1
    });

    this.areasSeleccionadas = [turno.area_id];
  }

  cerrarYCargar() {
    this.mostrarModal = false;
    this.cargarDatos();
    this.areasSeleccionadas = [];
    this.todasAreasSeleccionadas = false;
  }

  eliminar(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará este turno de la planificación.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.turnoService.deleteTurno(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El turno ha sido quitado.', 'success');
            this.cargarDatos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el turno.', 'error')
        });
      }
    });
  }

  esPasado(fecha: string): boolean {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    return fecha < hoyStr;
  }
}