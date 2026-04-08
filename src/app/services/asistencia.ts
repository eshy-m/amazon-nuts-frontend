import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = environment.apiUrl + '/asistencias';

  constructor(private http: HttpClient) { }

  // 📋 NUEVO: Obtener la tabla del día de hoy
  obtenerAsistenciasHoy(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hoy`);
  }

  // 📷 Registrar mediante QR o DNI manual
  registrarAsistencia(qrCode: string): Observable<any> {
    const body = { trabajador_id: qrCode };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/registrar`, body, { headers });
  }
  obtenerReportes(fechaInicio: string, fechaFin: string, busqueda: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);

    if (busqueda) {
      params = params.set('busqueda', busqueda);
    }

    return this.http.get(`${this.apiUrl}/reportes`, { params });
  }
}