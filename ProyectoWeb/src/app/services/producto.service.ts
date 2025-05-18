import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto, CreateProductoDTO } from '../models/producto.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<any>(`${this.baseUrl}/products`)
      .pipe(
        map(response => {
          if (response.data && response.data.products && Array.isArray(response.data.products)) {
            return response.data.products;
          } else if (Array.isArray(response)) {
            return response;
          } else {
            console.warn('La respuesta de productos no tiene el formato esperado:', response);
            return [];
          }
        })
      );
  }

  obtenerProductosPorCategoria(categoriaId: number): Observable<Producto[]> {
    const headers = this.getHeaders();
    
    return this.http.get<any>(`${this.baseUrl}/products/category/${categoriaId}`, { headers })
      .pipe(
        map(response => {
          console.log('Respuesta de productos por categoría:', response);
          if (response.data && response.data.products && Array.isArray(response.data.products)) {
            return response.data.products;
          } else if (Array.isArray(response)) {
            return response;
          } else if (response.data && Array.isArray(response.data)) {
            return response.data;
          } else {
            console.warn('La respuesta de productos por categoría no tiene el formato esperado:', response);
            return [];
          }
        })
      );
  }

  obtenerProductosPorVendedor(): Observable<Producto[]> {
    const headers = this.getHeaders();
    const userId = this.authService.obtenerUsuarioId();

    if (!userId) {
      throw new Error('No se encontró ID de usuario');
    }
    
    return this.http.get<any>(`${this.baseUrl}/products/seller/${userId}`, { headers })
      .pipe(
        map(response => {
          if (response.status === 'success' && response.data && response.data.products) {
            return response.data.products;
          }
          return [];
        })
      );
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<any>(`${this.baseUrl}/products/${id}`)
      .pipe(
        map(response => {
          console.log('Respuesta de detalle de producto:', response);
          
          // Si la respuesta viene en formato data.product
          if (response.data && response.data.product) {
            return response.data.product;
          }
          
          // Si la respuesta viene directamente como el objeto producto
          if (response.id && response.name) {
            return response;
          }
          
          // Si la respuesta tiene otro formato pero incluye la data del producto
          if (response.data) {
            return response.data;
          }
          
          console.warn('Formato de respuesta no reconocido para detalle de producto:', response);
          return response; // Devolvemos lo que sea que recibimos como último recurso
        })
      );
  }

  crearProducto(producto: CreateProductoDTO): Observable<Producto> {
    const headers = this.getHeaders();
    return this.http.post<Producto>(`${this.baseUrl}/products`, producto, { headers });
  }

  actualizarProducto(id: number, producto: Partial<CreateProductoDTO>): Observable<Producto> {
    const headers = this.getHeaders();
    return this.http.patch<Producto>(`${this.baseUrl}/products/${id}`, producto, { headers });
  }

  eliminarProducto(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.baseUrl}/products/${id}`, { headers });
  }
} 