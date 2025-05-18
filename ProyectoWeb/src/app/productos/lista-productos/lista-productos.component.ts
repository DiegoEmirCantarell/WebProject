import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DetalleProductoModalComponent } from '../detalle-producto-modal/detalle-producto-modal.component';
import { UsuariosModalComponent } from '../../shared/usuarios-modal/usuarios-modal.component';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DetalleProductoModalComponent, UsuariosModalComponent],
  templateUrl: './lista-productos.component.html',
  styleUrls: ['./lista-productos.component.css']
})
export class ListaProductosComponent implements OnInit {
  productos: Producto[] = [];
  loading = true;
  error = '';
  categoriaSeleccionada: string = '';
  isAuthenticated = false;
  isAdmin = false;
  
  // Variables para el modal de detalle de producto
  productoSeleccionado: Producto | null = null;
  modalVisible = false;
  
  // Variables para el modal de usuarios (admin)
  usuariosModalVisible = false;
  
  // Definir las categorías disponibles con sus IDs
  categorias = [
    { id: 1, nombre: 'Electrónica' },
    { id: 2, nombre: 'Ropa' },
    { id: 3, nombre: 'Hogar' },
    { id: 4, nombre: 'Herramientas' },
    { id: 5, nombre: 'Libros' },
    { id: 6, nombre: 'Juguetes' },
    { id: 7, nombre: 'Mascotas' },
    { id: 8, nombre: 'Belleza y salud' }
  ];

  constructor(
    private productoService: ProductoService,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
    this.verificarUsuario();
  }

  verificarUsuario(): void {
    this.isAuthenticated = this.authService.estaAutenticado();
    if (this.isAuthenticated) {
      const usuario = this.authService.getUsuarioActual();
      this.isAdmin = usuario?.role === 'admin';
    }
  }

  cargarProductos(categoriaId?: number): void {
    this.loading = true;
    this.error = '';
    
    if (categoriaId) {
      // Verificar si el usuario está autenticado antes de filtrar por categoría
      if (!this.isAuthenticated) {
        this.error = 'Debe iniciar sesión para filtrar productos por categoría.';
        this.loading = false;
        // Resetear la categoría seleccionada
        this.categoriaSeleccionada = '';
        // Cargar todos los productos
        this.cargarProductosSinFiltro();
        return;
      }
      
      // Usar el servicio para cargar productos por categoría
      this.productoService.obtenerProductosPorCategoria(categoriaId)
        .subscribe({
          next: (productos) => {
            this.procesarProductos(productos);
          },
          error: (err) => {
            // Si hay un error de autenticación, resetear la categoría y cargar todos los productos
            if (err.status === 401 || err.error?.message?.includes('not logged in')) {
              this.categoriaSeleccionada = '';
              this.error = 'Debe iniciar sesión para filtrar productos por categoría.';
              this.cargarProductosSinFiltro();
            } else {
              this.manejarError(err);
            }
          }
        });
    } else {
      this.cargarProductosSinFiltro();
    }
  }

  // Método para cargar todos los productos sin filtro
  private cargarProductosSinFiltro(): void {
    // Cargar todos los productos
    this.productoService.obtenerProductos()
      .subscribe({
        next: (productos) => {
          console.log('Productos recibidos:', productos);
          this.procesarProductos(productos);
        },
        error: (err) => {
          this.manejarError(err);
        }
      });
  }

  // Método para procesar las imágenes de los productos
  private procesarProductos(productos: any): void {
    // Verificar que productos sea un array
    if (!Array.isArray(productos)) {
      console.error('Se esperaba un array de productos pero se recibió:', productos);
      this.productos = [];
      this.loading = false;
      return;
    }
    
    console.log('Procesando array de productos con longitud:', productos.length);
    
    this.productos = productos.map((p: Producto) => {
      // Procesar correctamente las URLs de las imágenes
      if (p && p.image_url) {
        // Manejar URLs de ImgBB
        if (p.image_url.includes('ibb.co')) {
          // Si ya es una URL directa de i.ibb.co, la dejamos como está
          if (!p.image_url.includes('i.ibb.co')) {
            // Convertir URLs de página a URLs directas de imagen
            const idMatch = p.image_url.match(/ibb\.co\/([A-Za-z0-9]+)/);
            if (idMatch && idMatch[1]) {
              p.image_url = `https://i.ibb.co/${idMatch[1]}/image.jpg`;
            }
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
  }

  // Método para manejar errores
  private manejarError(err: any): void {
    console.error('Error al cargar productos:', err);
    if (err.error && err.error.message) {
      this.error = `Error: ${err.error.message}`;
    } else {
      this.error = 'Error al cargar los productos. Intente nuevamente.';
    }
    this.loading = false;
    this.productos = []; // Asegurar que productos sea un array vacío en caso de error
  }

  // Método para manejar el cambio de categoría
  onCategoriaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const categoriaId = selectElement.value ? parseInt(selectElement.value) : undefined;
    
    this.categoriaSeleccionada = selectElement.value;
    
    // Cargar productos por categoría o todos si no hay categoría seleccionada
    this.cargarProductos(categoriaId);
  }

  // Método para abrir el modal con los detalles del producto
  abrirDetalleProducto(producto: Producto): void {
    console.log('Abriendo detalle de producto:', producto);
    
    // Primero asignamos los datos básicos que ya tenemos
    this.productoSeleccionado = {...producto};
    this.modalVisible = true;
    
    // Luego intentamos obtener datos más detallados
    if (producto.id) {
      console.log('Obteniendo detalles adicionales para producto ID:', producto.id);
      this.productoService.obtenerProducto(producto.id)
        .subscribe({
          next: (detalleProducto) => {
            console.log('Detalles de producto recibidos:', detalleProducto);
            
            // Si detalleProducto está vacío o no tiene propiedades clave, mantenemos los datos originales
            if (!detalleProducto || !detalleProducto.name) {
              console.warn('Los detalles recibidos no tienen la información necesaria, manteniendo datos originales');
              return;
            }
            
            // Actualizar solo si recibimos datos válidos
            this.productoSeleccionado = {
              ...producto,  // Mantenemos los datos originales
              ...detalleProducto  // Sobreescribimos con los detalles nuevos
            };
          },
          error: (err) => {
            console.error('Error al cargar detalles del producto:', err);
            // Ya tenemos los datos básicos asignados, así que no necesitamos hacer nada más
          }
        });
    }
  }

  // Método para cerrar el modal de producto
  cerrarModal(): void {
    this.modalVisible = false;
    this.productoSeleccionado = null;
  }

  // Métodos para el modal de usuarios (admin)
  abrirModalUsuarios(): void {
    this.usuariosModalVisible = true;
  }

  cerrarModalUsuarios(): void {
    this.usuariosModalVisible = false;
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
        return `https://i.ibb.co/${idMatch[1]}/image.jpg`;
      }
    }
    
    return url;
  }
} 