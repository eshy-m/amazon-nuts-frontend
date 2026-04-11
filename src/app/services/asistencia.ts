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

  // 📋 OBTENER ASISTENCIAS DE HOY (Para el panel Admin)
  obtenerAsistenciasHoy(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hoy`);
  }

  // 📷 REGISTRAR ASISTENCIA VÍA QR (Para la pantalla de la puerta)
  registrarQR(dni: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/qr`, { dni }, { headers });
  }

  // ✍️ REGISTRAR ASISTENCIA MANUAL (Opcional, por si se pierde un fotocheck)
  registrarAsistencia(trabajador_id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/registrar`, { trabajador_id }, { headers });
  }

  // 📊 OBTENER REPORTES HISTÓRICOS (Para el panel Admin)
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