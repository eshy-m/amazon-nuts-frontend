import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  cargando: boolean = false;
  mensajeError: string = '';

  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    const urlLaravel = `${environment.apiUrl}/login`;

    this.http.post(urlLaravel, this.loginForm.value).subscribe({
      next: (respuesta: any) => {
        // 1. Guardamos el Token de seguridad en el navegador (La llave de la bóveda)
        localStorage.setItem('auth_token', respuesta.access_token);

        // 2. Guardamos los datos del usuario (opcional, para mostrar "Hola, Carlos")
        localStorage.setItem('user_data', JSON.stringify(respuesta.user));

        // 3. Lo enviamos al Panel de Administración
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.cargando = false;
        // Si puso mal la contraseña, Laravel nos manda un error 401
        if (err.status === 401) {
          this.mensajeError = 'Correo o contraseña incorrectos.';
        } else {
          this.mensajeError = 'Ocurrió un error en el servidor.';
        }
      }
    });
  }
}