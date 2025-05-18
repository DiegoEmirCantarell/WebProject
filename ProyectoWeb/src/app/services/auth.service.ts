import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Usuario, CredencialesLogin, RegistroUsuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api';
  private endpoint = 'auth';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    // Recuperar el usuario de sessionStorage al iniciar
    const usuarioGuardado = sessionStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioSubject.next(JSON.parse(usuarioGuardado));
    }
  }

  login(credenciales: CredencialesLogin): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${this.endpoint}/login`, credenciales)
      .pipe(
        map(response => {
          // Adapt API response to our Usuario model
          const usuario: Usuario = {
            id: response.data.user.id,
            nombre: response.data.user.name,
            email: response.data.user.email,
            token: response.token,
            role: response.data.user.role
          };
          
          this.usuarioSubject.next(usuario);
          sessionStorage.setItem('usuario', JSON.stringify(usuario));
          return usuario;
        })
      );
  }

  registro(datosUsuario: RegistroUsuario): Observable<Usuario> {
    // Adapt frontend model to API expectations
    const apiData = {
      name: datosUsuario.nombre + ' ' + datosUsuario.apellido,
      email: datosUsuario.email,
      password: datosUsuario.password,
      role: datosUsuario.role
    };
    return this.http.post<Usuario>(`${this.baseUrl}/${this.endpoint}/register`, apiData);
  }

  logout(): void {
    this.usuarioSubject.next(null);
    sessionStorage.removeItem('usuario');
  }

  obtenerToken(): string | null {
    const usuario = this.usuarioSubject.value;
    return usuario && usuario.token ? usuario.token : null;
  }

  updatePassword(newPassword: string): Observable<any> {
    const token = this.obtenerToken();
    if (!token) {
      throw new Error('Usuario no autenticado');
    }
    
    return this.http.patch<any>(`${this.baseUrl}/users/updatePassword`, 
      { password: newPassword },
      { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ).pipe(
      tap(response => {
        console.log('Contraseña actualizada:', response);
      })
    );
  }

  obtenerUsuarioId(): number | null {
    const usuario = this.usuarioSubject.value;
    return usuario && usuario.id ? usuario.id : null;
  }

  getUsuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  estaAutenticado(): boolean {
    return !!this.usuarioSubject.value;
  }
} 