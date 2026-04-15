import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private apiUrl = `${environment.apiUrl}/turnos`;

  constructor(private http: HttpClient) { }

  getTurnos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  crearTurno(turnoData: any): Observable<any> {
    return this.http.post(this.apiUrl, turnoData);
  }

  cerrarTurno(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cerrar`, {});
  }

  updateTurno(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteTurno(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  ejecutarAutoCierre(): Observable<any> {
    // Apunta al endpoint exacto que creamos en Laravel
    return this.http.post(`${this.apiUrl}/auto-cierre`, {});
  }

  // Añade este método
  descargarGeneralPDF(inicio: string, fin: string): Observable<any> {
    // Nota: Usamos environment.apiUrl directamente aquí para evitar el slash extra
    const url = `${environment.apiUrl}/turnos/reporte/general/pdf?inicio=${inicio}&fin=${fin}`;
    return this.http.get(url, { responseType: 'blob' }); // 'blob' es para recibir archivos binarios
  }

  // Añade este método
  descargarDetalladoExcel(inicio: string, fin: string): Observable<any> {
    const url = `${environment.apiUrl}/turnos/reporte/detallado/excel?inicio=${inicio}&fin=${fin}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}