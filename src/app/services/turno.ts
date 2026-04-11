import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Ajusta la ruta de tu environment

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private apiUrl = `${environment.apiUrl}/turnos`; // Ej: http://127.0.0.1:8000/api/turnos

  constructor(private http: HttpClient) { }

  // Obtener todos los turnos programados
  getTurnos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Crear un nuevo turno
  crearTurno(turnoData: any): Observable<any> {
    return this.http.post(this.apiUrl, turnoData);
  }

  // (Opcional) Cerrar el turno al final del día
  cerrarTurno(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cerrar`, {});
  }
}