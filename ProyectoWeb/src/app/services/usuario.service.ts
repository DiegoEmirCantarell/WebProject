import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface ListaUsuario {
  id: number;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  obtenerUsuarios(): Observable<ListaUsuario[]> {
    const token = this.authService.obtenerToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.baseUrl}/users/list`, { headers })
      .pipe(
        map(response => {
          console.log('Respuesta original:', response);
          
          // Comprobar la estructura específica mencionada por el usuario
          if (response && 
              response.data && 
              response.data.users && 
              Array.isArray(response.data.users)) {
            console.log('Estructura encontrada: data.users');
            return response.data.users;
          }
          
          // Comprobar las otras estructuras como respaldo
          if (Array.isArray(response)) {
            console.log('Estructura encontrada: array directo');
            return response;
          }
          
          if (response && response.data && Array.isArray(response.data)) {
            console.log('Estructura encontrada: data array');
            return response.data;
          }
          
          if (response && response.users && Array.isArray(response.users)) {
            console.log('Estructura encontrada: users array');
            return response.users;
          }
          
          // Si no se encontró un array, devolver un array vacío
          console.error('Formato de respuesta no reconocido:', response);
          return [];
        })
      );
  }
}
