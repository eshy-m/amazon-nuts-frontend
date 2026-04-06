import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Usamos la ruta relativa que sí te funciona
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

  // Lista de trabajadores
  public lista: any[] = [];

  // Objeto del formulario
  public form: any = this.obtenerFormularioVacio();

  constructor(
    private api: TrabajadorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.obtener();
  }

  // Obtener la lista desde el Backend
  obtener(): void {
    this.api.listar().subscribe({
      next: (data: any) => {
        this.lista = data;
        // 3. ¡EL TOQUE MÁGICO! Le decimos a Angular que actualice la pantalla YA.
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al obtener los trabajadores:', err)
    });
  }

  // Registrar un nuevo trabajador
  guardar(): void {
    // Validaciones básicas
    if (!this.form.dni || this.form.dni.toString().length !== 8) {
      alert('El DNI debe tener exactamente 8 dígitos.');
      return;
    }
    if (!this.form.area) {
      alert('Por favor, selecciona el área asignada.');
      return;
    }

    this.api.registrar(this.form).subscribe({
      next: () => {
        alert('¡Trabajador registrado y QR generado con éxito!');
        this.obtener(); // Recargar lista
        this.form = this.obtenerFormularioVacio(); // Limpiar formulario
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Error al registrar. Verifica que el DNI no esté duplicado.');
      }
    });
  }

  // Función auxiliar para mantener el código limpio y no repetir la limpieza
  private obtenerFormularioVacio(): any {
    return {
      nombres: '',
      apellidos: '',
      dni: '',
      area: '',
      celular: '',
      direccion: '',
      experiencia: false,
      observaciones: '',
      fecha_inicio: ''
    };
  }

  // Imprimir carnets
  imprimir(): void {
    window.print();
  }
}