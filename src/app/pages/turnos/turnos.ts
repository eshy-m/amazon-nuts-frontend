import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurnoService } from '../../services/turno';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.css']
})
export class Turnos implements OnInit {
  turnoForm: FormGroup;

  turnos: any[] = []; // Lista original plana
  turnosAgrupados: any[] = []; // 🔥 NUEVO: Lista agrupada por día

  // Variables de control de Interfaz
  vistaAgrupada: boolean = true; // 🔥 NUEVO: Por defecto mostramos la vista agrupada
  mostrarModal = false;
  modoEdicion = false;
  idEditando: number | null = null;

  areas: string[] = ['Jefe de Control de Calidad', 'Selección', 'Caldeo', 'Quebrado', 'Envasado', 'Mantenimiento'];
  tiposRegistro: string[] = ['Turno de Trabajo', 'Día Libre', 'Vacaciones', 'Descanso Médico'];

  constructor(private fb: FormBuilder, private turnoService: TurnoService) {
    this.turnoForm = this.fb.group({
      area: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      hora_entrada: ['08:00'],
      hora_salida: ['17:00'],
      tipo_registro: ['Turno de Trabajo', Validators.required],
      tolerancia_minutos: [15],
      es_nocturno: [false]
    });

    this.turnoForm.get('tipo_registro')?.valueChanges.subscribe(tipo => {
      if (tipo !== 'Turno de Trabajo') {
        this.turnoForm.get('hora_entrada')?.disable();
        this.turnoForm.get('hora_salida')?.disable();
      } else {
        this.turnoForm.get('hora_entrada')?.enable();
        this.turnoForm.get('hora_salida')?.enable();
      }
    });
  }

  ngOnInit(): void {
    this.turnoService.ejecutarAutoCierre().subscribe(() => {
      this.cargarTurnos();
    });
  }

  cargarTurnos() {
    this.turnoService.getTurnos().subscribe({
      next: (data) => {
        this.turnos = data;
        this.agruparTurnos(); // 🔥 Llamamos a la magia de agrupación
      },
      error: (err) => console.error('Error al cargar turnos', err)
    });
  }

  // 🔥 NUEVA FUNCIÓN: Toma la lista plana y la agrupa por la columna "fecha"
  agruparTurnos() {
    const grupos = this.turnos.reduce((acumulador: any[], turno: any) => {
      // Buscamos si ya existe un grupo para esta fecha
      let grupo = acumulador.find(g => g.fecha === turno.fecha);

      // Si no existe, creamos la "Tarjeta del Día"
      if (!grupo) {
        grupo = { fecha: turno.fecha, turnosDelDia: [] };
        acumulador.push(grupo);
      }

      // Metemos el turno dentro de su día correspondiente
      grupo.turnosDelDia.push(turno);
      return acumulador;
    }, []);

    this.turnosAgrupados = grupos;
  }

  // --- GESTIÓN DE MODAL ---

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.idEditando = null;
    this.turnoForm.reset({
      tipo_registro: 'Turno de Trabajo',
      tolerancia_minutos: 15,
      es_nocturno: false
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(turno: any) {
    if (turno.estado === 'Cerrado') {
      Swal.fire('Turno Cerrado', 'No se pueden editar turnos que ya finalizaron.', 'info');
      return;
    }
    this.modoEdicion = true;
    this.idEditando = turno.id;

    this.turnoForm.patchValue({
      area: turno.area,
      fecha_inicio: turno.fecha,
      fecha_fin: turno.fecha,
      hora_entrada: turno.hora_entrada,
      hora_salida: turno.hora_salida,
      tipo_registro: turno.tipo_registro,
      tolerancia_minutos: turno.tolerancia_minutos,
      es_nocturno: turno.es_nocturno
    });
    this.mostrarModal = true;
  }

  // --- ACCIONES ---

  guardar() {
    if (this.turnoForm.invalid) {
      Swal.fire('Atención', 'Completa los campos obligatorios', 'warning');
      return;
    }

    const datos = this.turnoForm.getRawValue();

    if (this.modoEdicion && this.idEditando) {
      this.turnoService.updateTurno(this.idEditando, datos).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Turno corregido con éxito', 'success');
          this.cerrarYCargar();
        }
      });
    } else {
      this.turnoService.crearTurno(datos).subscribe({
        next: (res) => {
          Swal.fire('¡Éxito!', res.message, 'success');
          this.cerrarYCargar();
        }
      });
    }
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Eliminar turno?',
      text: "Esta acción no se puede deshacer si no hay asistencias.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.turnoService.deleteTurno(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El registro fue borrado.', 'success');
            this.cargarTurnos();
          },
          error: (err) => Swal.fire('Error', err.error.message, 'error')
        });
      }
    });
  }

  cerrarYCargar() {
    this.mostrarModal = false;
    this.cargarTurnos();
  }
}