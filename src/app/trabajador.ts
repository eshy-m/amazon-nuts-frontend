import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  // Apunta a http://localhost:8000/api/trabajadores según tu environment local
  private url = `${environment.apiUrl}/trabajadores`;

  constructor(private http: HttpClient) { }

  // Obtiene la lista de todos los trabajadores y sus QR
  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  // Envía los datos del formulario al backend para crear un trabajador y generar su QR
  registrar(datos: any): Observable<any> {
    return this.http.post<any>(this.url, datos);
  }
}