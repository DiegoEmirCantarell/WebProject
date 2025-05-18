import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Método genérico para obtener datos
  get<T>(endpoint: string, params?: any): Observable<T> {
    const headers = this.getHeaders();
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { headers, params: httpParams });
  }

  // Método genérico para crear datos
  post<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getHeaders();
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  // Método genérico para actualizar datos
  put<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getHeaders();
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  // Método genérico para eliminar datos
  delete<T>(endpoint: string): Observable<T> {
    const headers = this.getHeaders();
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { headers });
  }

  // Método genérico para actualizar parcialmente datos
  patch<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getHeaders();
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  // Método para obtener headers con token de autenticación
  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
} 