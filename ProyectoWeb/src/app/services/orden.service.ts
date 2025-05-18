import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Orden, EstadoOrden } from '../models/orden.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private endpoint = 'ordenes';

  constructor(private apiService: ApiService) { }

  obtenerOrdenes(): Observable<Orden[]> {
    return this.apiService.get<Orden[]>(this.endpoint);
  }

  obtenerOrden(id: number): Observable<Orden> {
    return this.apiService.get<Orden>(`${this.endpoint}/${id}`);
  }

  crearOrden(orden: Orden): Observable<Orden> {
    return this.apiService.post<Orden>(this.endpoint, orden);
  }

  actualizarEstadoOrden(id: number, estado: EstadoOrden): Observable<Orden> {
    return this.apiService.patch<Orden>(`${this.endpoint}/${id}`, { estado });
  }

  cancelarOrden(id: number): Observable<Orden> {
    return this.apiService.patch<Orden>(`${this.endpoint}/${id}`, { estado: 'cancelada' });
  }
} 