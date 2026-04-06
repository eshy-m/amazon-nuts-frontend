import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // <-- Importamos el environment
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  // Toma la URL base del environment y le agrega el prefijo del módulo
  private apiUrl = environment.apiUrl + '/asistencias';

  constructor(private http: HttpClient) { }

  // Envía el DNI y el área al backend de Laravel
  registrarAsistencia(dni: string, area_trabajo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, { dni, area_trabajo });
  }
}