import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {

  private url = `${environment.apiUrl}/trabajadores`;

  constructor(private http: HttpClient) { }

  // 📊 Llama a la ruta de estadísticas
  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.url}/estadisticas`);
  }

  // 📋 Obtiene la lista de todos los trabajadores
  listar(): Observable<any> {
    return this.http.get(this.url);
  }

  // ➕ Envía los datos para crear un trabajador
  registrar(datos: any): Observable<any> {
    return this.http.post(this.url, datos);
  }
  // En tu archivo del Servicio (TrabajadorService)
  actualizarConFoto(id: number, formData: FormData) {
    // Le decimos a Laravel que lo trate como una actualización (PUT) aunque viaje por POST
    formData.append('_method', 'PUT');

    // OJO: Usamos POST aquí
    return this.http.post(`${this.url}/${id}`, formData);
  }
  // ✏️ Envía los datos para actualizar un trabajador existente
  actualizar(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.url}/${id}`, datos);
  }

  // 🗑️ Elimina a un trabajador por su ID
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }
}