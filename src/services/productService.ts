import api from '../api/client';

export interface Product {
  _id: string;
  name: string;
  abbreviation: string;
  description?: string;
  category: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  };
}

class ProductService {
  async getProducts(): Promise<ProductListResponse> {
    const response = await api.get('/products');
    return response.data;
  }

  async getMyProducts(): Promise<ProductListResponse> {
    const response = await api.get('/products/my-products');
    return response.data;
  }

  async getProductById(id: string): Promise<{ success: boolean; data: { product: Product } }> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: { product: Product } }> {
    const response = await api.post('/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<{ success: boolean; data: { product: Product } }> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
}

export const productService = new ProductService();