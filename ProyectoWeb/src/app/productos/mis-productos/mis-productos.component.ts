import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-mis-productos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-productos.component.html',
  styleUrls: ['./mis-productos.component.css']
})
export class MisProductosComponent implements OnInit {
  productos: Producto[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.error = '';
    
    this.productoService.obtenerProductosPorVendedor()
      .subscribe({
        next: (productos) => {
          this.productos = productos.map(p => {
            // Procesar correctamente las URLs de las imágenes
            if (p.image_url) {
              // Manejar URLs de ImgBB
              if (p.image_url.includes('ibb.co')) {
                // Convertir las URLs de página de ImgBB a URLs directas de imagen
                // Formato típico de ImgBB: https://ibb.co/XkZ1t5dw
                // URL directa: https://i.ibb.co/[identificador]/[nombre-archivo]
                // Como no podemos obtener la URL directa directamente de la URL de página,
                // podemos seguir usando la URL de página, que al menos mostrará la imagen
                // en un iframe, o alternativamente, podríamos usar una URL de placeholder
                
                // Si ya es una URL directa (i.ibb.co), la dejamos como está
                if (!p.image_url.includes('i.ibb.co')) {
                  // Esto es un placeholder ya que no podemos convertir automáticamente
                  // las URLs de ibb.co a i.ibb.co sin conocer el ID de imagen completo
                  console.log('URL de ImgBB detectada, usando como está:', p.image_url);
                }
              } else if (p.image_url.includes('imgur.com')) {
                // Mantener la lógica para Imgur por si hay imágenes antiguas
                p.image_url = p.image_url.replace('http://', 'https://');
                if (!p.image_url.includes('i.imgur.com')) {
                  p.image_url = p.image_url.replace(/(?:www\.)?imgur\.com\/(\w+)/, 'i.imgur.com/$1.jpg');
                }
              }
            }
            return p;
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar productos:', err);
          this.error = 'Error al cargar los productos. Intente nuevamente.';
          this.loading = false;
        }
      });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id)
        .subscribe({
          next: () => {
            // La API devuelve 204 No Content en caso de éxito
            this.productos = this.productos.filter(p => p.id !== id);
            console.log('Producto eliminado correctamente');
          },
          error: (err) => {
            console.error('Error al eliminar producto:', err);
            if (err.status === 404) {
              alert('El producto no se encontró. Puede que ya haya sido eliminado.');
            } else {
              alert('Error al eliminar el producto. Intente nuevamente.');
            }
          }
        });
    }
  }

  // Método auxiliar para asegurar que la imagen se muestre correctamente
  getSafeImageUrl(url: string | undefined): string {
    if (!url) return 'assets/images/placeholder.png';
    
    // Para URLs de ImgBB, verificamos si es la URL de la página (ibb.co) y no la directa (i.ibb.co)
    if (url.includes('ibb.co')) {
      // Si ya es una URL directa de i.ibb.co, la usamos directamente
      if (url.includes('i.ibb.co')) {
        return url;
      }
      
      // Si es una URL de visualización de ImgBB (como https://ibb.co/XkZ1t5dw)
      // intentamos extraer el ID y formar una URL directa de prueba
      const idMatch = url.match(/ibb\.co\/([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1]) {
        // Intentamos una URL directa con el ID extraído
        // Esto es una aproximación, ya que la URL real también incluiría el nombre del archivo
        // pero podemos usar una extensión genérica
        return `https://i.ibb.co/${idMatch[1]}/image.jpg`;
      }
    }
    
    return url;
  }
}
