import api from '../api/client';

export interface Department {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentListResponse {
  success: boolean;
  data: {
    departments: Department[];
    total: number;
    page: number;
    totalPages: number;
  };
}

class DepartmentService {
  async getDepartments(): Promise<DepartmentListResponse> {
    const response = await api.get('/departments');
    return response.data;
  }

  async getDepartmentById(id: string): Promise<{ success: boolean; data: { department: Department } }> {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  }

  async createDepartment(data: { name: string; description: string }): Promise<{ success: boolean; data: { department: Department } }> {
    const response = await api.post('/departments', data);
    return response.data;
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<{ success: boolean; data: { department: Department } }> {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  }

  async deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  }
}

export const departmentService = new DepartmentService();