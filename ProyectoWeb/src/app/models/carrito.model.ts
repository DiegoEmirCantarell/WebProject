import { Producto } from './producto.model';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface Carrito {
  id?: number;
  userId?: number;
  items: ItemCarrito[];
  total: number;
} 