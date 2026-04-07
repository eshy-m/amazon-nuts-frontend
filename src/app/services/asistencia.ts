import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  // Ajusta la URL a tu entorno de producción (Hostinger)
  private apiUrl = environment.apiUrl + '/asistencias';
  //private apiUrl = 'https://eshypro.com/backend/public/api/asistencias';

  constructor(private http: HttpClient) { }

  // Ahora solo mandamos el código del QR al backend (trabajador_id)
  registrarAsistencia(qrCode: string): Observable<any> {
    const body = { trabajador_id: qrCode };
    // 🟢 NUEVO: Forzamos a Laravel a tratarnos como una API pura
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/registrar`, body);
  }
}