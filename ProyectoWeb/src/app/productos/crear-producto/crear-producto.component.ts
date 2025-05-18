import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../services/producto.service';
import { Producto, CreateProductoDTO } from '../../models/producto.model';

@Component({
  selector: 'app-crear-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit {
  productoForm: FormGroup;
  isEditing: boolean = false;
  productoId?: number;
  loading: boolean = false;
  error: string = '';
  categorias = [
    { id: 1, category: 'Electrónica' },
    { id: 2, category: 'Ropa' },
    { id: 3, category: 'Hogar' },
    { id: 4, category: 'Herramientas' },
    { id: 5, category: 'Libros' },
    { id: 6, category: 'Juguetes' },
    { id: 7, category: 'Mascotas' },
    { id: 8, category: 'Belleza y salud' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productoService: ProductoService
  ) {
    this.productoForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      image_url: [''],
      category_product_id: [1, [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Solo obtener el ID si estamos en la ruta de edición
    const url = this.router.url;
    if (url.includes('/editar/')) {
      this.isEditing = true;
      this.productoId = Number(this.route.snapshot.paramMap.get('id'));
      
      if (this.productoId) {
        this.cargarProducto(this.productoId);
      }
    }
  }

  cargarProducto(id: number): void {
    this.loading = true;
    
    this.productoService.obtenerProducto(id)
      .subscribe({
        next: (producto) => {
          this.productoForm.patchValue({
            name: producto.name,
            description: producto.description,
            price: producto.price,
            stock: producto.stock,
            image_url: producto.image_url || '',
            category_product_id: producto.category_product_id || 1
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar producto:', err);
          this.error = 'Error al cargar el producto. Intente nuevamente.';
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      this.loading = true;
      this.error = '';
      
      const productoData: CreateProductoDTO = this.productoForm.value;
      
      if (this.isEditing && this.productoId) {
        this.productoService.actualizarProducto(this.productoId, productoData)
          .subscribe({
            next: () => {
              this.router.navigate(['/mis-productos']);
            },
            error: (err) => {
              console.error('Error al actualizar producto:', err);
              this.error = 'Error al actualizar el producto. Intente nuevamente.';
              this.loading = false;
            }
          });
      } else {
        this.productoService.crearProducto(productoData)
          .subscribe({
            next: () => {
              this.router.navigate(['/mis-productos']);
            },
            error: (err) => {
              console.error('Error al crear producto:', err);
              this.error = 'Error al crear el producto. Intente nuevamente.';
              this.loading = false;
            }
          });
      }
    }
  }

  // Método para obtener la URL correcta para la vista previa
  getPreviewUrl(url: string): string {
    if (!url) return '';
    
    // Para URLs de ImgBB
    if (url.includes('ibb.co')) {
      // Si ya es una URL directa de i.ibb.co, la usamos tal cual
      if (url.includes('i.ibb.co')) {
        return url;
      }
      
      // Si es una URL de visualización, intentamos extraer el ID
      const idMatch = url.match(/ibb\.co\/([A-Za-z0-9]+)/);
      if (idMatch && idMatch[1]) {
        // Intentamos formar una URL directa aproximada
        return `https://i.ibb.co/${idMatch[1]}/image.jpg`;
      }
    }
    
    return url;
  }
}
