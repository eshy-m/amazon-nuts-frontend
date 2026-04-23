import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperacionesService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ==========================================
  // PANEL DEL INGENIERO (CONTROL DE OPERACIONES)
  // ==========================================

  iniciarLote(data: any) {
    return this.http.post(`${this.apiUrl}/operaciones/iniciar-lote`, data);
  }

  // 🔴 CORRECCIÓN: Ya no pide el (loteId: number)
  getMetricas() {
    return this.http.get(`${this.apiUrl}/operaciones/metricas`);
  }

  registrarMuestreo(data: any) {
    return this.http.post(`${this.apiUrl}/operaciones/muestreos`, data);
  }

  // 🔴 CORRECCIÓN: Se agregó la función cerrarLote
  cerrarLote(id: number) {
    return this.http.put(`${this.apiUrl}/operaciones/lotes/${id}/cerrar`, {});
  }


  // ==========================================
  // ÁREA DE SECADO (HORNOS)
  // ==========================================
  getProcesosSecado() {
    // 🔴 CORREGIDO: Antes decía /secado/activos, ahora coincide con Laravel
    return this.http.get(`${this.apiUrl}/secado/procesos-activos`);
  }

  iniciarSecado(data: any) {
    return this.http.post(`${this.apiUrl}/secado/iniciar`, data);
  }

  finalizarSecado(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/secado/finalizar/${id}`, data);
  }
  cerrarLoteSecado(loteId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/secado/lote/${loteId}/cerrar`, {});
  }
  // ==========================================
  // KIOSCO Y TABLETS (OPERARIOS SELECCIÓN)
  // ==========================================
  getLoteActivo() {
    // IMPORTANTE: Asegúrate de que la ruta coincida con la de api.php
    return this.http.get(`${this.apiUrl}/operaciones/lotes/activo`);
  }

  registrarPesaje(data: any) {
    return this.http.post(`${this.apiUrl}/pesajes`, data);
  }

  sincronizarPesajes(data: any) {
    return this.http.post(`${this.apiUrl}/pesajes/sincronizar`, data);
  }

  deshacerPesaje(id: number) {
    return this.http.delete(`${this.apiUrl}/pesajes/deshacer/${id}`);
  }
  // operaciones.service.ts

  getLoteActivoSecado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/operaciones/lote-activo-secado`);
  }

  enviarASecado(id: number) {
    return this.http.post(`${this.apiUrl}/operaciones/enviar-a-secado/${id}`, {});
  }

  getProcesosActivos() {
    return this.http.get(`${this.apiUrl}/secado/procesos-activos`);
  }
}