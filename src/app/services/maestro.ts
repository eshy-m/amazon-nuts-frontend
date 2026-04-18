import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MaestroService {
    private apiUrl: string = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Obtener todas las áreas de la base de datos
    getAreas(): Observable<any> {
        return this.http.get(`${this.apiUrl}/maestros/areas`);
    }

    // Obtener todos los cargos de la base de datos
    getCargos(): Observable<any> {
        return this.http.get(`${this.apiUrl}/maestros/cargos`);
    }
}