import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 🔥 Necesario para ngClass, ngFor, ngIf
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // 🔥 Necesario para los formularios
import { TurnoService } from '../../services/turno'; // Ajusta la ruta si es necesario
import Swal from 'sweetalert2';

@Component({
  selector: 'app-turnos',
  standalone: true, // 🔥 Asegura que sea Standalone
  imports: [CommonModule, ReactiveFormsModule], // 🔥 Aquí inyectamos los módulos que faltaban
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.css'] // o styleUrl: './turnos.css' dependiendo de tu versión
})
export class TurnosComponent implements OnInit {
  turnoForm: FormGroup;
  turnos: any[] = [];
  areas: string[] = ['Jefe de Control de Calidad', 'Selección', 'Caldeo', 'Quebrado', 'Envasado', 'Mantenimiento'];

  constructor(private fb: FormBuilder, private turnoService: TurnoService) {
    // Inicializamos el formulario
    this.turnoForm = this.fb.group({
      area: ['', Validators.required],
      fecha: ['', Validators.required],
      hora_entrada: ['', Validators.required],
      hora_salida: ['', Validators.required],
      tolerancia_minutos: [15, Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  cargarTurnos() {
    this.turnoService.getTurnos().subscribe({
      next: (data) => this.turnos = data,
      error: (err) => console.error('Error al cargar turnos', err)
    });
  }

  guardarTurno() {
    if (this.turnoForm.invalid) {
      Swal.fire('Error', 'Por favor completa todos los campos', 'warning');
      return;
    }

    this.turnoService.crearTurno(this.turnoForm.value).subscribe({
      next: (res) => {
        Swal.fire('¡Éxito!', 'Turno programado correctamente', 'success');
        this.turnoForm.reset({ tolerancia_minutos: 15 }); // Resetea dejando la tolerancia en 15
        this.cargarTurnos(); // Recarga la tabla
      },
      error: (err) => {
        Swal.fire('Error', 'Hubo un problema al guardar', 'error');
        console.error(err);
      }
    });
  }
}