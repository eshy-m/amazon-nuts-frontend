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
    // src/app/auth/login/login.ts

    this.http.post(`${environment.apiUrl}/login`, this.loginForm.value).subscribe({
      next: (res: any) => {
        localStorage.setItem('auth_token', res.access_token);
        localStorage.setItem('user_data', JSON.stringify(res.user));

        const user = res.user;

        // 1. Si es Administrador (Role 1), va al Dashboard
        if (user.role_id === 1) {
          this.router.navigate(['/admin/dashboard']);
        }
        // 2. Si el área es Secado (ID 2), va a Secado (Prioridad sobre rol de operario)
        else if (user.name === 'SECADO') {
          this.router.navigate(['/secado-terminal']);
        }
        // 3. Por defecto, si es operario (Role 2) sin área específica, va a selección
        else if (user.name === 'SELECCION' || user.role_id === 2) {
          this.router.navigate(['/operario/registros']);
        }
        else {
          this.router.navigate(['/']);
        }
      }
    });
  }
}