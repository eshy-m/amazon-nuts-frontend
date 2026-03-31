import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Importamos ReactiveFormsModule
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  // Variable para mostrar mensajes de éxito o error
  mensajeExito: string = '';
  enviando: boolean = false;

  productosInteres = [
    { id: 'whole', nombre: 'Castañas Enteras (Whole)' },
    { id: 'chipped', nombre: 'Castañas Sin Puntas (Chipped)' },
    { id: 'broken', nombre: 'Castañas en Trozos (Broken)' }
  ];

  // Creamos la estructura del formulario con sus validaciones
  contactoForm: FormGroup = this.fb.group({
    sender_name: ['', Validators.required],
    company: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    country: ['', Validators.required],
    product_interest: ['', Validators.required],
    message: ['', Validators.required]
  });

  // Función que se ejecuta al darle clic al botón Enviar
  enviarMensaje() {
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched(); // Muestra los errores si faltan datos
      return;
    }

    this.enviando = true;
    const urlLaravel = 'https://amazon-nuts-backend-production.up.railway.app/api/contact'; // La ruta de tu Backend

    this.http.post(urlLaravel, this.contactoForm.value).subscribe({
      next: (respuesta: any) => {
        this.mensajeExito = '¡Cotización enviada con éxito! Nos pondremos en contacto pronto.';
        this.contactoForm.reset(); // Limpiamos el formulario
        this.contactoForm.get('product_interest')?.setValue(''); // Reseteamos el select
        this.enviando = false;
      },
      error: (err) => {
        console.error('Error al enviar:', err);
        alert('Hubo un error al enviar el mensaje. Revisa la consola.');
        this.enviando = false;
      }
    });
  }
}