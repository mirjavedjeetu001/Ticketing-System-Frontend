import api from '../api/client';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'admin' | 'agent' | 'user';
  department?: string;
  departmentId?: string;
  productAccess?: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  timezone?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'agent' | 'user';
  department?: string;
  departmentId?: string;
  productAccess?: string[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'agent' | 'user';
  department?: string;
  departmentId?: string;
  productAccess?: string[];
  isActive?: boolean;
}

export interface UserListResponse {
  success: boolean;
  data: {
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
  message?: string;
}

class UserService {
  // Get all users with filtering and pagination
  async getUsers(params?: {
    role?: string;
    department?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UserListResponse> {
    const response = await api.get('/users', { params });
    return response.data;
  }

  // Get user by ID
  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Create new user
  async createUser(userData: CreateUserData): Promise<UserResponse> {
    const response = await api.post('/users', userData);
    return response.data;
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserData): Promise<UserResponse> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  }

  // Delete user (soft delete)
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  // Update user password
  async updatePassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/users/${id}/password`, { password: newPassword });
    return response.data;
  }

  // Get users by role (agents, admins, etc.)
  async getUsersByRole(role: string): Promise<UserListResponse> {
    return this.getUsers({ role });
  }

  // Get users by department
  async getUsersByDepartment(departmentId: string): Promise<UserListResponse> {
    const response = await api.get(`/users/department/${departmentId}`);
    return response.data;
  }

  // Get users with access to specific product
  async getUsersByProduct(productId: string): Promise<UserListResponse> {
    const response = await api.get(`/users/product/${productId}`);
    return response.data;
  }
}

export default new UserService();