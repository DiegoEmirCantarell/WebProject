import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService, CarritoItem } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  items: CarritoItem[] = [];
  total: number = 0;
  loading: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  constructor(private carritoService: CarritoService) { }

  ngOnInit(): void {
    this.carritoService.carritoItems$.subscribe(items => {
      this.items = items;
    });

    this.carritoService.obtenerPrecioTotal().subscribe(total => {
      this.total = total;
    });
  }

  aumentarCantidad(id: number): void {
    this.carritoService.aumentarCantidad(id);
  }

  disminuirCantidad(id: number): void {
    this.carritoService.disminuirCantidad(id);
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Está seguro de eliminar este producto del carrito?')) {
      this.carritoService.eliminarProducto(id);
    }
  }

  vaciarCarrito(): void {
    if (confirm('¿Está seguro de vaciar el carrito?')) {
      this.carritoService.vaciarCarrito();
    }
  }

  getSafeImageUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    
    // Para URLs de ImgBB
    if (url.includes('ibb.co')) {
      // Si ya es una URL directa de i.ibb.co, la usamos directamente
      if (url.includes('i.ibb.co')) {
        return url;
      }
      
      // Si es una URL de visualización de ImgBB
      const idMatch = url.match(/ibb\.co\/([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1]) {
        return `https://i.ibb.co/${idMatch[1]}/image.jpg`;
      }
    }
    
    return url;
  }

  procesarCompra(): void {
    if (this.items.length === 0) {
      this.mostrarMensaje('El carrito está vacío', 'error');
      return;
    }

    this.loading = true;
    this.carritoService.procesarCompra()
      .subscribe({
        next: (respuesta) => {
          console.log('Compra procesada:', respuesta);
          this.mostrarMensaje('Compra realizada con éxito', 'success');
          this.carritoService.vaciarCarrito();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al procesar la compra:', err);
          
          // Mensaje personalizado según el error
          let mensajeError = 'Hubo un error al procesar su compra. Intente nuevamente.';
          
          if (err.error && err.error.message) {
            mensajeError = err.error.message;
          } else if (err.error && err.error.data && err.error.data.errors) {
            // Si hay errores específicos para algunos productos
            const errorsStr = err.error.data.errors
              .map((e: any) => `${e.message} (ID: ${e.id})`)
              .join(', ');
            mensajeError = `Errores en productos: ${errorsStr}`;
          }
          
          this.mostrarMensaje(mensajeError, 'error');
          this.loading = false;
        }
      });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 5000);
  }
} 