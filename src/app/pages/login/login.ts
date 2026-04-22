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
  // Inyección de servicios moderna (estilo Angular 17+)
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  // Definición del formulario con validaciones básicas
  loginForm: FormGroup = this.fb.group({
    login: ['', [Validators.required]], // Puede ser email o el nombre 'OPERARIO'
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  // Estados de la interfaz
  cargando: boolean = false;
  mensajeError: string = '';

  /**
   * Procesa el intento de inicio de sesión
   */
  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';

    // Llamada al endpoint de autenticación en Laravel
    this.http.post(`${environment.apiUrl}/login`, this.loginForm.value).subscribe({
      next: (res: any) => {
        // 1. Almacenamos el token y los datos del usuario en el navegador
        localStorage.setItem('auth_token', res.access_token);
        localStorage.setItem('user_data', JSON.stringify(res.user));

        // 2. 🚦 REDIRECCIÓN INTELIGENTE SEGÚN EL ROL
        // Role ID 1 = Administrador / Role ID 2 = Operario
        if (res.user.role_id === 1) {
          console.log('Acceso: Administrador');
          this.router.navigate(['/admin/dashboard']);
        }
        else if (res.user.role_id === 2 || res.user.name === 'OPERARIO') {
          console.log('Acceso: Operario');
          this.router.navigate(['/operario/registros']);
        }
        else {
          // Si el usuario tiene un rol no definido, lo enviamos al home por seguridad
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.cargando = false;
        // Manejo de errores amigable
        if (err.status === 401) {
          this.mensajeError = 'Usuario o contraseña incorrectos.';
        } else {
          this.mensajeError = 'Error de conexión con el servidor. Intente más tarde.';
        }
      }
    });
  }
}