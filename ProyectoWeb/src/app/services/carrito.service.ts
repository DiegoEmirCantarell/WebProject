import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Producto } from '../models/producto.model';
import { AuthService } from './auth.service';

// Interfaz para los elementos del carrito
export interface CarritoItem {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
}

// Interfaz para la solicitud de actualización de stock
export interface UpdateStockRequest {
  products: {
    id: number;
    quantity: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private baseUrl = 'http://localhost:3000/api';
  private carritoItemsSubject = new BehaviorSubject<CarritoItem[]>(this.getElementosGuardados());
  public carritoItems$ = this.carritoItemsSubject.asObservable();
  
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

  // Obtener elementos del localStorage
  private getElementosGuardados(): CarritoItem[] {
    const items = localStorage.getItem('carritoItems');
    return items ? JSON.parse(items) : [];
  }

  // Guardar elementos en localStorage
  private guardarElementos(items: CarritoItem[]): void {
    localStorage.setItem('carritoItems', JSON.stringify(items));
    this.carritoItemsSubject.next(items);
  }

  // Agregar producto al carrito
  agregarProducto(producto: Producto, cantidad: number = 1): void {
    const items = this.getElementosGuardados();
    const existeItem = items.find(item => item.id === producto.id);

    if (existeItem) {
      // Si el producto ya está en el carrito, incrementar la cantidad
      existeItem.quantity += cantidad;
    } else {
      // Si es un nuevo producto, agregarlo al carrito
      const nuevoItem: CarritoItem = {
        id: producto.id!,
        name: producto.name,
        price: producto.price,
        image_url: producto.image_url,
        quantity: cantidad
      };
      items.push(nuevoItem);
    }

    this.guardarElementos(items);
  }

  // Aumentar cantidad de un producto
  aumentarCantidad(id: number): void {
    const items = this.getElementosGuardados();
    const item = items.find(item => item.id === id);
    
    if (item) {
      item.quantity += 1;
      this.guardarElementos(items);
    }
  }

  // Disminuir cantidad de un producto
  disminuirCantidad(id: number): void {
    const items = this.getElementosGuardados();
    const item = items.find(item => item.id === id);
    
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        this.guardarElementos(items);
      } else {
        this.eliminarProducto(id);
      }
    }
  }

  // Eliminar un producto del carrito
  eliminarProducto(id: number): void {
    const items = this.getElementosGuardados().filter(item => item.id !== id);
    this.guardarElementos(items);
  }

  // Vaciar carrito
  vaciarCarrito(): void {
    this.guardarElementos([]);
  }

  // Obtener cantidad total de productos en el carrito
  obtenerCantidadTotal(): Observable<number> {
    return new Observable<number>(observer => {
      this.carritoItems$.subscribe(items => {
        const cantidad = items.reduce((total, item) => total + item.quantity, 0);
        observer.next(cantidad);
      });
    });
  }

  // Obtener precio total del carrito
  obtenerPrecioTotal(): Observable<number> {
    return new Observable<number>(observer => {
      this.carritoItems$.subscribe(items => {
        const total = items.reduce((suma, item) => suma + (item.price * item.quantity), 0);
        observer.next(total);
      });
    });
  }

  // Procesar la compra y actualizar el stock
  procesarCompra(): Observable<any> {
    const items = this.getElementosGuardados();
    
    if (items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const requestBody: UpdateStockRequest = {
      products: items.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    };

    const headers = this.getHeaders();
    
    return this.http.post<any>(`${this.baseUrl}/products/updateStock`, requestBody, { headers });
  }
} 