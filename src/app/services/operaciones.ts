import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OperacionesService {
  private apiUrl = environment.apiUrl + '/operaciones';

  constructor(private http: HttpClient) { }

  // --- MÉTODOS COMPARTIDOS ---
  getLoteActivo() {
    return this.http.get(`${this.apiUrl}/lotes/activo`);
  }

  // --- MÉTODOS DEL INGENIERO ---
  iniciarLote(datos: any) {
    // datos: { cantidad_sacos, peso_por_saco }
    return this.http.post(`${this.apiUrl}/lotes`, datos);
  }

  registrarMuestreo(datos: any) {
    // datos: { lote_id, peso_muestra, peso_entera, peso_partida, peso_ojos, peso_podrido }
    return this.http.post(`${this.apiUrl}/muestreos`, datos);
  }

  getMetricas(loteId: number) {
    return this.http.get(`${this.apiUrl}/lotes/${loteId}/metricas`);
  }

  // --- MÉTODOS DEL OPERARIO ---
  registrarPesaje(datos: any) {
    // datos: { lote_id, categoria, peso }
    return this.http.post(`${this.apiUrl}/pesajes`, datos);
  }
}