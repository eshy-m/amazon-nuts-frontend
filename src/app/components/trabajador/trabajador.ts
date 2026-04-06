import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

// Asegúrate de que esta ruta apunte a donde realmente guardaste tu servicio
import { TrabajadorService } from '../../services/trabajador';

@Component({
  selector: 'app-trabajador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trabajador.html',
  styleUrls: ['./trabajador.css']
})
export class TrabajadorComponent implements OnInit {
  // Aquí se guardarán los trabajadores que lleguen de la base de datos
  lista: any[] = [];

  // Modelo para capturar los datos del formulario
  form = {
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

  // Inyectamos nuestro servicio
  constructor(private api: TrabajadorService) { }

  // Al cargar la pantalla, pedimos la lista inmediatamente
  ngOnInit(): void {
    this.obtener();
  }

  // Llama al servicio para traer los datos
  obtener() {
    this.api.listar().subscribe({
      next: (res) => {
        this.lista = res;
      },
      error: (err) => {
        console.error('Error al cargar trabajadores:', err);
      }
    });
  }

  // Llama al servicio para registrar uno nuevo
  // Llama al servicio para registrar uno nuevo
  guardar() {
    // Validaciones rápidas
    if (!this.form.dni || this.form.dni.length !== 8) {
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
        this.obtener(); // Recargamos la lista de fotochecks

        // 👇 ESTA ES LA MAGIA QUE LIMPIA EL FORMULARIO 👇
        this.form = {
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
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Error al registrar. Verifica que el DNI no esté duplicado.');
      }
    });
  }
  // Activa el modo impresión del navegador para imprimir los carnets
  imprimir() {
    window.print();
  }
  // En tu componente .ts
  public urlStorage = 'https://eshypro.com/backend/public/storage/';
}