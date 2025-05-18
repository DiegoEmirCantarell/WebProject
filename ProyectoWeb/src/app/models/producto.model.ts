export interface Categoria {
  id: number;
  category: string;
}

export interface Vendedor {
  id: number;
  name: string;
  email: string;
}

export interface Producto {
  id?: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_product_id: number;
  stock: number;
  user_id?: number;
  category?: Categoria;
  seller?: Vendedor;
}

export interface CreateProductoDTO {
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_product_id: number;
  stock: number;
} 