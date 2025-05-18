import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Pago, DatosTarjeta, MetodoPago } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private endpoint = 'pagos';

  constructor(private apiService: ApiService) { }

  obtenerPagos(): Observable<Pago[]> {
    return this.apiService.get<Pago[]>(this.endpoint);
  }

  obtenerPago(id: number): Observable<Pago> {
    return this.apiService.get<Pago>(`${this.endpoint}/${id}`);
  }

  obtenerPagosPorOrden(ordenId: number): Observable<Pago[]> {
    return this.apiService.get<Pago[]>(`${this.endpoint}`, { ordenId });
  }

  procesarPagoTarjeta(ordenId: number, monto: number, datosTarjeta: DatosTarjeta): Observable<Pago> {
    const pago: Pago = {
      ordenId,
      monto,
      metodoPago: 'tarjeta',
      estado: 'pendiente',
      datosPago: datosTarjeta
    };
    return this.apiService.post<Pago>(this.endpoint, pago);
  }

  procesarPagoPaypal(ordenId: number, monto: number): Observable<Pago> {
    const pago: Pago = {
      ordenId,
      monto,
      metodoPago: 'paypal',
      estado: 'pendiente'
    };
    return this.apiService.post<Pago>(`${this.endpoint}/paypal`, pago);
  }

  procesarPago(ordenId: number, monto: number, metodoPago: MetodoPago, datosPago?: any): Observable<Pago> {
    const pago: Pago = {
      ordenId,
      monto,
      metodoPago,
      estado: 'pendiente',
      datosPago
    };
    return this.apiService.post<Pago>(this.endpoint, pago);
  }

  confirmarPago(pagoId: number): Observable<Pago> {
    return this.apiService.patch<Pago>(`${this.endpoint}/${pagoId}`, { estado: 'completado' });
  }

  cancelarPago(pagoId: number): Observable<Pago> {
    return this.apiService.patch<Pago>(`${this.endpoint}/${pagoId}`, { estado: 'fallido' });
  }
} 